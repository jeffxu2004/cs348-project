import mysql.connector
from mysql.connector import Error

class MovieApp:
    def __init__(self, host, database, user, password):
        try:
            self.connection = mysql.connector.connect(
                host=host,
                database=database,
                user=user,
                password=password
            )
            if self.connection.is_connected():
                print("Database connection open.\n")
        except Error as e:
            print(f"Error while connecting to MySQL: {e}")

    def close(self):
        if self.connection.is_connected():
            self.connection.close()
            print("Database connection closed.")

    def main_menu(self):
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
        query = "SELECT imdb_id, title, rating FROM Movies ORDER BY rating DESC LIMIT 10;"
        cursor = self.connection.cursor()
        cursor.execute(query)
        print("\n**Start of Answer**")
        for (imdb_id, title, rating) in cursor:
            print(f"{title} ({imdb_id}) - Rating: {rating}")
        print("**End of Answer**")
        cursor.close()

    def search_by_genre(self, genre):
        query = "SELECT imdb_id, title, genre FROM Movies WHERE genre LIKE %s;"
        cursor = self.connection.cursor()
        like_pattern = f"%{genre}%"
        cursor.execute(query, (like_pattern,))
        print("\n**Start of Answer**")
        found = False
        for (imdb_id, title, genres) in cursor:
            print(f"{title} ({imdb_id}) - Genres: {genres}")
            found = True
        if not found:
            print("No movies found for that genre.")
        print("**End of Answer**")
        cursor.close()

    def get_movies_by_year(self, year):
        query = "SELECT imdb_id, title FROM Movies WHERE year = %s;"
        cursor = self.connection.cursor()
        cursor.execute(query, (year,))
        print("\n**Start of Answer**")
        found = False
        for (imdb_id, title) in cursor:
            print(f"{title} ({imdb_id})")
            found = True
        if not found:
            print(f"No movies found from the year {year}.")
        print("**End of Answer**")
        cursor.close()

if __name__ == "__main__":
    # Replace with your own MySQL connection info
    HOST = "localhost"
    DATABASE = "movie_db"
    USER = "your_username"
    PASSWORD = "your_password"

    app = MovieApp(HOST, DATABASE, USER, PASSWORD)
    try:
        app.main_menu()
    finally:
        app.close()
