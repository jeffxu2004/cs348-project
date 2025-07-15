import os
import zipfile
import gzip
import requests
import random
from io import BytesIO
import pandas as pd
from tqdm import tqdm
import mysql.connector
from faker import Faker

# Configuration: update these with your MySQL credentials and DB details
config = {
    "host": "localhost",
    "user": "admin",
    "password": "pass",
    "database": "movie_app",
}

def insert_dataframe_to_mysql(df, table_name, connection_config, batch_size=5000):

    columns = list(df.columns)
    column_names = ", ".join(
        f"{col}" for col in columns
    )  # Backticks for reserved words
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f"INSERT INTO `{table_name}` ({column_names}) VALUES ({placeholders})"
    data = [
        tuple([element if not pd.isna(element) else None for element in row])
        for row in df.values
    ]
    conn = mysql.connector.connect(**connection_config)
    cursor = conn.cursor(buffered=True)

    # Insert in batches
    print(f"About to insert to {table_name}...")
    for i in tqdm(
        range(0, len(data), batch_size), total=len(data) // batch_size + 1, leave=False
    ):
        batch = data[i : i + batch_size]
        cursor.executemany(sql, batch)
        conn.commit()
    print(f"Done insertion into {table_name}!")

    cursor.close()
    conn.close()

# Base URL for IMDb datasets
BASE_URL = "https://datasets.imdbws.com"
DATA_FILES = {
    "titles": "title.basics.tsv.gz",
    "ratings": "title.ratings.tsv.gz",
    "names": "name.basics.tsv.gz",
    "crew": "title.crew.tsv.gz",
    "principals": "title.principals.tsv.gz",
}

def load_tsv_gz(filename, chunksize=100_000, **kwargs):
    print(f"Starting download for {filename}...")
    url = f"{BASE_URL}/{filename}"
    response = requests.get(url, stream=True)
    response.raise_for_status()

    chunks = []
    with gzip.GzipFile(fileobj=response.raw) as f:
        for chunk in pd.read_csv(
            f,
            sep="\t",
            na_values="\\N",
            low_memory=False,
            chunksize=chunksize,
            **kwargs,
        ):
            chunks.append(chunk)

    df = pd.concat(chunks, ignore_index=True)
    print(f"Completed download for {filename}: {len(df)} rows loaded.")
    return df


MOVIELENS_URL = 'https://files.grouplens.org/datasets/movielens/ml-25m.zip'
FILES_TO_LOAD = {'links.csv', 'ratings.csv', 'tags.csv'}

def download_movielens_zip():
    """
    Downloads the MovieLens zip file and returns a ZipFile object.
    """
    print('Downloading the movielens dataset, may take some time...')
    response = requests.get(MOVIELENS_URL)
    response.raise_for_status()
    return zipfile.ZipFile(BytesIO(response.content))

def load_movielens_data() -> dict:
    """
    Downloads and loads all three MovieLens CSV files into a dictionary of DataFrames.
    Keys are 'ratings', 'tags', 'links'.
    """
    dfs = {}
    with download_movielens_zip() as zf:
        for file_name in FILES_TO_LOAD:
            with zf.open(f"ml-25m/{file_name}") as file:
                key = file_name.replace('.csv', '')
                dfs[key] = pd.read_csv(file)
    return dfs

def create_users(id):
    user_id = 'u' + str(id)
    fake_user_name = Faker().user_name()
    fake_password = fake_user_name + 'password' +str(random.randint(10, 999))
    return (user_id, fake_user_name, fake_password, False)


# Main ETL process
def main():
    dfs = load_movielens_data()
    link_csv, tags, rating_df = dfs['links'], dfs['tags'], dfs['ratings']
    
    # 1. Load raw datasets
    df_titles = load_tsv_gz(DATA_FILES["titles"])
    df_ratings = load_tsv_gz(DATA_FILES["ratings"])
    df_names = load_tsv_gz(DATA_FILES["names"])
    df_crew = load_tsv_gz(DATA_FILES["crew"])
    df_principals = load_tsv_gz(DATA_FILES["principals"])

    # 2. Clean and transform titles
    allowed_types = ["movie"]
    df_titles_clean = df_titles[df_titles["titleType"].isin(allowed_types)].copy()
    df_titles_clean["startYear"] = pd.to_numeric(
        df_titles_clean["startYear"], errors="coerce"
    )
    df_titles_clean["runtimeMinutes"] = pd.to_numeric(
        df_titles_clean["runtimeMinutes"], errors="coerce"
    )

    # 3. Clean and transform names
    df_names_clean = df_names.copy()
    df_names_clean["birthYear"] = pd.to_numeric(
        df_names_clean["birthYear"], errors="coerce"
    )
    df_names_clean["deathYear"] = pd.to_numeric(
        df_names_clean["deathYear"], errors="coerce"
    )

    # 4. Prepare title_table by merging ratings
    df_ratings_valid = df_ratings[
        df_ratings["tconst"].isin(df_titles_clean["tconst"])
    ].copy()
    df_ratings_valid["averageRating"] = pd.to_numeric(
        df_ratings_valid["averageRating"], errors="coerce"
    )
    df_ratings_valid["numVotes"] = pd.to_numeric(
        df_ratings_valid["numVotes"], errors="coerce"
    )

    title_table = pd.merge(
        df_titles_clean[["tconst", "primaryTitle", "startYear", "runtimeMinutes"]],
        df_ratings_valid[["tconst", "averageRating", "numVotes"]],
        on="tconst",
        how="left",
    )
    title_table.columns = [
        "tconst",
        "primary_title",
        "release_year",
        "runtime",
        "average_rating",
        "numvotes",
    ]
    insert_dataframe_to_mysql(title_table, "title", config)
    
    
    genres_table = df_titles_clean[["tconst", "genres"]]
    genres_table.dropna(subset=["genres"], inplace=True)
    genres_table.genres = genres_table.genres.str.split(",")
    genres_table = genres_table.explode("genres")
    insert_dataframe_to_mysql(genres_table, "genres", config)

    # Cache valid keys
    valid_tconst = set(title_table["tconst"])
    valid_nconst = set(df_names_clean["nconst"])

    # 5. Prepare people_table
    people_table = df_names_clean[
        ["nconst", "primaryName", "birthYear", "deathYear"]
    ].copy()
    people_table.columns = ["nconst", "name", "birthyear", "deathyear"]
    insert_dataframe_to_mysql(people_table, "people", config)

    # 6. Known-for titles table
    know_for = df_names_clean[["nconst", "knownForTitles"]].dropna()
    know_for["knownForTitles"] = know_for["knownForTitles"].str.split(",")
    know_for = know_for.explode("knownForTitles")
    know_for_table = know_for[["nconst", "knownForTitles"]].copy()
    know_for_table.columns = ["nconst", "title"]
    know_for_table = know_for_table[
        know_for_table["nconst"].isin(valid_nconst)
        & know_for_table["title"].isin(valid_tconst)
    ]
    insert_dataframe_to_mysql(know_for_table, "know_for", config)

    # 7. Primary profession table
    prof = df_names_clean[["nconst", "primaryProfession"]].dropna()
    prof["primaryProfession"] = prof["primaryProfession"].str.split(",")
    prof = prof.explode("primaryProfession")
    primary_profession = prof[["nconst", "primaryProfession"]].copy()
    primary_profession.columns = ["nconst", "profession"]
    primary_profession = primary_profession[
        primary_profession["nconst"].isin(valid_nconst)
    ]
    insert_dataframe_to_mysql(primary_profession, "profession", config)

    # 8. Crew: split into director and writer tables
    df_crew_clean = df_crew[df_crew["tconst"].isin(valid_tconst)].copy()

    # Director table
    directors = df_crew_clean[["tconst", "directors"]].dropna()
    directors["directors"] = directors["directors"].str.split(",")
    directors = directors.explode("directors")
    director_table = directors[["tconst", "directors"]].copy()
    director_table.columns = ["tconst", "nconst"]
    director_table = director_table[
        director_table["tconst"].isin(valid_tconst)
        & director_table["nconst"].isin(valid_nconst)
    ]
    insert_dataframe_to_mysql(director_table, "director", config)

    # Writer table
    writers = df_crew_clean[["tconst", "writers"]].dropna()
    writers["writers"] = writers["writers"].str.split(",")
    writers = writers.explode("writers")
    writer_table = writers[["tconst", "writers"]].copy()
    writer_table.columns = ["tconst", "nconst"]
    writer_table = writer_table[
        writer_table["tconst"].isin(valid_tconst)
        & writer_table["nconst"].isin(valid_nconst)
    ]
    insert_dataframe_to_mysql(writer_table, "writer", config)

    # 9. Principals: rename columns
    principal_df = df_principals[
        df_principals["tconst"].isin(valid_tconst)
        & df_principals["nconst"].isin(valid_nconst)
    ].copy()
    principal_df.columns = [
        "tconst",
        "ordering",
        "nconst",
        "category",
        "job",
        "character_name",
    ]
    #insert_dataframe_to_mysql(principal_df, "principal", config)
    
    # creating user table
    user_table = []
    user_table.append(('a01', 'admin', 'admin', True))
    user_table.append(('u00', 'alice', 'passAlice123', False))
    
    for id in tqdm(rating_df.userId.unique(), total=len(rating_df.userId.unique()), leave=False):
        user_table.append(create_users(id))
        
    df = pd.DataFrame(user_table, columns=['userid', 'username', 'password', 'isAdmin'])
    
    insert_dataframe_to_mysql(df, 'user', config)


    # links    
    zero_to_add = (7 - link_csv.imdbId.astype(str).str.len()).map(lambda x: max(x, 0))
    for i in range(len(zero_to_add)):
        zero_to_add[i] = zero_to_add[i] * '0'
    link_csv['tconst'] =  'tt' + zero_to_add +link_csv.imdbId.astype(str)
    
    movie_id = set(df_titles_clean['tconst'])
    link_csv = link_csv[link_csv.tconst.isin(movie_id)]

    # favorites table
    favorites_table = rating_df[rating_df.rating == 5.0]
    favorites_table = favorites_table[['userId', 'movieId']].reset_index()
    favorites_table['userId'] = 'u' + favorites_table['userId'].astype('str')
    favorites_table = pd.merge(link_csv, favorites_table, on="movieId", how="inner")[['userId', 'tconst']]
    favorites_table.columns = ['userid', 'tconst']
    insert_dataframe_to_mysql(favorites_table, 'favorites', config)
    

    print("IMDb data loaded and validated successfully.")


if __name__ == "__main__":
    main()