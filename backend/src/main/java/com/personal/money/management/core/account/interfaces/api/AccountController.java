package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.application.AccountService;
import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.interfaces.api.dto.AccountRequest;
import com.personal.money.management.core.account.interfaces.api.dto.AccountResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> listAccounts() {
        List<Account> accounts = accountService.listAccounts();
        List<AccountResponse> response = accounts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@RequestBody AccountRequest request) {
        Account account = toDomain(request);
        Account created = accountService.createAccount(account);
        return ResponseEntity.ok(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Long id, @RequestBody AccountRequest request) {
        Account account = toDomain(request);
        Account updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total-balance")
    public ResponseEntity<BigDecimal> getTotalBalance() {
        BigDecimal totalBalance = accountService.getTotalBalanceOfActiveAccounts();
        return ResponseEntity.ok(totalBalance);
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountName(),
                account.getInitBalance(),
                account.getType(),
                account.getCurrency(),
                account.getDescription()
        );
    }

    private Account toDomain(AccountRequest request) {
        return new Account(
                request.getAccountName(),
                request.getInitBalance(),
                request.getType(),
                request.getCurrency(),
                request.getDescription()
        );
    }
}
