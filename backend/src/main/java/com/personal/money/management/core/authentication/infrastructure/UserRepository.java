package com.personal.money.management.core.authentication.infrastructure;

import com.personal.money.management.core.authentication.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
