import ibm_db

class MovieApp:
    def __init__(self, host, port, database, user, password):
        try:
            self.connection = ibm_db.connect("cs348", "", "")
            print("Database connection open.\n")
        except Exception as e:
            print(f"Error while connecting to DB2: {e}")
            self.connection = None

    def close(self):
        if self.connection:
            ibm_db.close(self.connection)
            print("Database connection closed.")

    def main_menu(self):
        if not self.connection:
            print("No database connection.")
            return

        while True:
            print("\n-- Actions --")
            print("Select an option: \n"
                  "  1) List top-rated movies\n"
                  "  2) Search movies by genre\n"
                  "  3) Get movies by year\n"
                  "  0) Exit\n")
            try:
                selection = int(input("Your choice: ").strip())
            except ValueError:
                print("Please enter a valid number.")
                continue

            if selection == 1:
                self.list_top_movies()
            elif selection == 2:
                genre = input("Enter genre (e.g., Drama, Crime): ").strip()
                self.search_by_genre(genre)
            elif selection == 3:
                year = input("Enter year (e.g., 1994): ").strip()
                self.get_movies_by_year(year)
            elif selection == 0:
                print("Exiting...")
                break
            else:
                print("Invalid action.")

    def list_top_movies(self):
        query = "SELECT imdb_id, title, rating FROM movies ORDER BY rating DESC FETCH FIRST 10 ROWS ONLY"
        stmt = ibm_db.exec_immediate(self.connection, query)
        print("\n**Start of Answer**")
        row = ibm_db.fetch_assoc(stmt)
        while row:
            print(f"{row['TITLE']} ({row['IMDB_ID']}) - Rating: {row['RATING']}")
            row = ibm_db.fetch_assoc(stmt)
        print("**End of Answer**")

    def search_by_genre(self, genre):
        query = "SELECT imdb_id, title, genre FROM movies WHERE genre LIKE ?"
        stmt = ibm_db.prepare(self.connection, query)
        pattern = f"%{genre}%"
        ibm_db.bind_param(stmt, 1, pattern)
        ibm_db.execute(stmt)
        print("\n**Start of Answer**")
        found = False
        row = ibm_db.fetch_assoc(stmt)
        while row:
            print(f"{row['TITLE']} ({row['IMDB_ID']}) - Genres: {row['GENRE']}")
            found = True
            row = ibm_db.fetch_assoc(stmt)
        if not found:
            print("No movies found for that genre.")
        print("**End of Answer**")

    def get_movies_by_year(self, year):
        query = "SELECT imdb_id, title FROM movies WHERE year = ?"
        stmt = ibm_db.prepare(self.connection, query)
        ibm_db.bind_param(stmt, 1, year)
        ibm_db.execute(stmt)
        print("\n**Start of Answer**")
        found = False
        row = ibm_db.fetch_assoc(stmt)
        while row:
            print(f"{row['TITLE']} ({row['IMDB_ID']})")
            found = True
            row = ibm_db.fetch_assoc(stmt)
        if not found:
            print(f"No movies found from the year {year}.")
        print("**End of Answer**")


if __name__ == "__main__":
    HOST = "localhost"
    PORT = 50000
    DATABASE = "movie_db"
    USER = "your_username"
    PASSWORD = "your_password"

    app = MovieApp(HOST, PORT, DATABASE, USER, PASSWORD)
    try:
        app.main_menu()
    finally:
        app.close()
