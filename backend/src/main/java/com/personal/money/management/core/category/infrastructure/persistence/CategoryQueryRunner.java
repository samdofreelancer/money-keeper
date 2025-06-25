package com.personal.money.management.core.category.infrastructure.persistence;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CategoryQueryRunner {

    public static void main(String[] args) {
        if (args.length < 5) {
            System.err.println("Usage: java CategoryQueryRunner <username> <password> <host> <port> <service>");
            System.exit(1);
        }

        String username = args[0];
        String password = args[1];
        String host = args[2];
        String port = args[3];
        String service = args[4];

        String jdbcUrl = String.format("jdbc:oracle:thin:@%s:%s/%s", host, port, service);

        try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password)) {
            String sql = "SELECT id, name, icon, type, parent_id FROM CORE.categories ORDER BY id";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                System.out.println("Categories in database:");
                while (rs.next()) {
                    int id = rs.getInt("id");
                    String name = rs.getString("name");
                    String icon = rs.getString("icon");
                    String type = rs.getString("type");
                    Integer parentId = rs.getObject("parent_id") != null ? rs.getInt("parent_id") : null;

                    System.out.printf("ID: %d, Name: %s, Icon: %s, Type: %s, Parent ID: %s%n",
                            id, name, icon, type, parentId != null ? parentId.toString() : "null");
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error:");
            e.printStackTrace();
            System.exit(2);
        }
    }
}
