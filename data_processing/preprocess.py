import os
import gzip
import requests
import pandas as pd
from sqlalchemy import create_engine, URL

# Configuration: update these with your MySQL credentials and DB details
DB_USER = "root"
DB_PASS = "password"
DB_HOST = 'localhost'
DB_NAME = 'movie_app'
url_object = URL.create(
    "mysql+pymysql",
    username=DB_USER,
    password=DB_PASS,
    host=DB_HOST,
    database=DB_NAME,
)

# Base URL for IMDb datasets
BASE_URL = 'https://datasets.imdbws.com'
DATA_FILES = {
    'titles': 'title.basics.tsv.gz',
    'ratings': 'title.ratings.tsv.gz',
    'names': 'name.basics.tsv.gz',
    'crew': 'title.crew.tsv.gz',
    'principals': 'title.principals.tsv.gz'
}

def load_tsv_gz(filename, chunksize=100_000, **kwargs):
    print(f"Starting download for {filename}...")
    url = f"{BASE_URL}/{filename}"
    response = requests.get(url, stream=True)
    response.raise_for_status()

    chunks = []
    with gzip.GzipFile(fileobj=response.raw) as f:
        for chunk in pd.read_csv(f, sep='\t', na_values='\\N', low_memory=False,
                                 chunksize=chunksize, **kwargs):
            chunks.append(chunk)

    df = pd.concat(chunks, ignore_index=True)
    print(f"Completed download for {filename}: {len(df)} rows loaded.")
    return df

# Main ETL process
def main():
    engine = create_engine(url_object)

    # 1. Load raw datasets
    df_titles = load_tsv_gz(DATA_FILES['titles'])
    df_ratings = load_tsv_gz(DATA_FILES['ratings'])
    df_names = load_tsv_gz(DATA_FILES['names'])
    df_crew = load_tsv_gz(DATA_FILES['crew'])
    df_principals = load_tsv_gz(DATA_FILES['principals'])

    # 2. Clean and transform titles
    allowed_types = ['movie']
    df_titles_clean = df_titles[df_titles['titleType'].isin(allowed_types)].copy()
    df_titles_clean['startYear'] = pd.to_numeric(df_titles_clean['startYear'], errors='coerce')
    df_titles_clean['runtimeMinutes'] = pd.to_numeric(df_titles_clean['runtimeMinutes'], errors='coerce')

    # 3. Clean and transform names
    df_names_clean = df_names.copy()
    df_names_clean['birthYear'] = pd.to_numeric(df_names_clean['birthYear'], errors='coerce')
    df_names_clean['deathYear'] = pd.to_numeric(df_names_clean['deathYear'], errors='coerce')

    # 4. Prepare title_table by merging ratings
    df_ratings_valid = df_ratings[df_ratings['tconst'].isin(df_titles_clean['tconst'])].copy()
    df_ratings_valid['averageRating'] = pd.to_numeric(df_ratings_valid['averageRating'], errors='coerce')
    df_ratings_valid['numVotes'] = pd.to_numeric(df_ratings_valid['numVotes'], errors='coerce')

    title_table = pd.merge(
        df_titles_clean[['tconst', 'primaryTitle', 'startYear', 'runtimeMinutes']],
        df_ratings_valid[['tconst', 'averageRating', 'numVotes']],
        on='tconst', how='left'
    )
    title_table.columns = ['tconst', 'primary_title', 'release_year', 'runtime', 'average_rating', 'numvotes']
    print("Writing title_table to database...")
    title_table.to_sql('title_table', engine, if_exists='append', index=False)
    print("Finished writing title_table.")

    # Cache valid keys
    valid_tconst = set(title_table['tconst'])
    valid_nconst = set(df_names_clean['nconst'])

    # 5. Prepare people_table
    people_table = df_names_clean[['nconst', 'primaryName', 'birthYear', 'deathYear']].copy()
    people_table.columns = ['nconst', 'name', 'birthyear', 'deathyear']
    print("Writing people_table to database...")
    people_table.to_sql('people_table', engine, if_exists='append', index=False)
    print("Finished writing people_table.")

    # 6. Known-for titles table
    know_for = df_names_clean[['nconst', 'knownForTitles']].dropna()
    know_for['knownForTitles'] = know_for['knownForTitles'].str.split(',')
    know_for = know_for.explode('knownForTitles')
    know_for_table = know_for[['nconst', 'knownForTitles']].copy()
    know_for_table.columns = ['nconst', 'title']
    know_for_table = know_for_table[
        know_for_table['nconst'].isin(valid_nconst) &
        know_for_table['title'].isin(valid_tconst)
    ]
    print("Writing know_for_table to database...")
    know_for_table.to_sql('know_for_table', engine, if_exists='append', index=False)
    print("Finished writing know_for_table.")

    # 7. Primary profession table
    prof = df_names_clean[['nconst', 'primaryProfession']].dropna()
    prof['primaryProfession'] = prof['primaryProfession'].str.split(',')
    prof = prof.explode('primaryProfession')
    primary_profession = prof[['nconst', 'primaryProfession']].copy()
    primary_profession.columns = ['nconst', 'profession']
    primary_profession = primary_profession[primary_profession['nconst'].isin(valid_nconst)]
    print("Writing primary_profession to database...")
    primary_profession.to_sql('primary_profession', engine, if_exists='append', index=False)
    print("Finished writing primary_profession.")

    # 8. Crew: split into director and writer tables
    df_crew_clean = df_crew[df_crew['tconst'].isin(valid_tconst)].copy()

    # Director table
    directors = df_crew_clean[['tconst', 'directors']].dropna()
    directors['directors'] = directors['directors'].str.split(',')
    directors = directors.explode('directors')
    director_table = directors[['tconst', 'directors']].copy()
    director_table.columns = ['tconst', 'nconst']
    director_table = director_table[
        director_table['tconst'].isin(valid_tconst) &
        director_table['nconst'].isin(valid_nconst)
    ]
    print("Writing director_table to database...")
    director_table.to_sql('director_table', engine, if_exists='append', index=False)
    print("Finished writing director_table.")

    # Writer table
    writers = df_crew_clean[['tconst', 'writers']].dropna()
    writers['writers'] = writers['writers'].str.split(',')
    writers = writers.explode('writers')
    writer_table = writers[['tconst', 'writers']].copy()
    writer_table.columns = ['tconst', 'nconst']
    writer_table = writer_table[
        writer_table['tconst'].isin(valid_tconst) &
        writer_table['nconst'].isin(valid_nconst)
    ]
    print("Writing writer_table to database...")
    writer_table.to_sql('writer_table', engine, if_exists='append', index=False)
    print("Finished writing writer_table.")

    # 9. Principals: rename columns
    principal_df = df_principals[
        df_principals['tconst'].isin(valid_tconst) &
        df_principals['nconst'].isin(valid_nconst)
    ].copy()
    principal_df.columns = ["tconst", "ordering", "nconst", "category", "job", "character_name"]
    print("Writing principals_table to database...")
    principal_df.to_sql('principals_table', engine, if_exists='append', index=False)
    print("Finished writing principals_table.")

    print('IMDb data loaded and validated successfully.')

if __name__ == '__main__':
    main()