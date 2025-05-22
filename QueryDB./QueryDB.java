import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Scanner;

public class MovieApp {

    private Scanner input = new Scanner(System.in);
    private Connection connection = null;

    public MovieApp(String[] args) {
        try {
            Class.forName("com.ibm.db2.jcc.DB2Driver");
        } catch (ClassNotFoundException e) {
            System.out.println("Missing DBMS driver.");
            e.printStackTrace();
        }

        try {
            // Replace with your actual JDBC connection string, database, user, password
            connection = DriverManager.getConnection(
                "jdbc:db2://localhost:50000/movie_db", "your_username", "your_password");
            System.out.println("Database connection open.\n");
            connection.setAutoCommit(false);
        } catch (SQLException e) {
            System.out.println("DBMS connection failed.");
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws Exception {
        MovieApp app = new MovieApp(args);
        app.mainMenu();
        app.exit();
    }

    public void exit() {
        try {
            if (connection != null) {
                connection.close();
                System.out.println("Database connection closed.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void mainMenu() throws SQLException {
        mainMenu:
        while (true) {
            System.out.println("\n-- Actions --");
            System.out.println(
                    "Select an option: \n" +
                            "  1) List top-rated movies\n" +
                            "  2) Search movies by genre\n" +
                            "  3) Get movies by year\n" +
                            "  0) Exit\n"
            );
            int selection = input.nextInt();
            input.nextLine();

            switch (selection) {
                case 1:
                    listTopMovies();
                    break;
                case 2:
                    System.out.println("Enter genre (e.g., Drama, Crime): ");
                    String genre = input.nextLine().trim();
                    searchByGenre(genre);
                    break;
                case 3:
                    System.out.println("Enter year (e.g., 1994): ");
                    String year = input.nextLine().trim();
                    getMoviesByYear(year);
                    break;
                case 0:
                    System.out.println("Exiting...");
                    break mainMenu;
                default:
                    System.out.println("Invalid action.");
                    break;
            }
        }
    }

    private void listTopMovies() throws SQLException {
        String sql = "SELECT imdb_id, title, rating FROM movies ORDER BY rating DESC FETCH FIRST 10 ROWS ONLY";
        PreparedStatement stmt = connection.prepareStatement(sql);
        ResultSet rs = stmt.executeQuery();

        System.out.println("**Start of Answer**");
        while (rs.next()) {
            String imdbId = rs.getString("imdb_id");
            String title = rs.getString("title");
            double rating = rs.getDouble("rating");
            System.out.println(title + " (" + imdbId + ") - Rating: " + rating);
        }
        System.out.println("**End of Answer**");

        rs.close();
        stmt.close();
        connection.commit();
    }

    private void searchByGenre(String genre) throws SQLException {
        String sql = "SELECT imdb_id, title, genre FROM movies WHERE genre LIKE ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, "%" + genre + "%");
        ResultSet rs = stmt.executeQuery();

        System.out.println("**Start of Answer**");
        boolean found = false;
        while (rs.next()) {
            String imdbId = rs.getString("imdb_id");
            String title = rs.getString("title");
            String genres = rs.getString("genre");
            System.out.println(title + " (" + imdbId + ") - Genres: " + genres);
            found = true;
        }
        if (!found) {
            System.out.println("No movies found for that genre.");
        }
        System.out.println("**End of Answer**");

        rs.close();
        stmt.close();
        connection.commit();
    }

    private void getMoviesByYear(String year) throws SQLException {
        String sql = "SELECT imdb_id, title FROM movies WHERE year = ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, year);
        ResultSet rs = stmt.executeQuery();

        System.out.println("**Start of Answer**");
        boolean found = false;
        while (rs.next()) {
            String imdbId = rs.getString("imdb_id");
            String title = rs.getString("title");
            System.out.println(title + " (" + imdbId + ")");
            found = true;
        }
        if (!found) {
            System.out.println("No movies found from the year " + year + ".");
        }
        System.out.println("**End of Answer**");

        rs.close();
        stmt.close();
        connection.commit();
    }
}
