package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.application.AccountService;
import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.interfaces.api.dto.AccountRequest;
import com.personal.money.management.core.account.interfaces.api.dto.AccountResponse;
import com.personal.money.management.core.account.application.exception.DuplicateAccountNameException;
import com.personal.money.management.core.account.application.CurrencyService;
import com.personal.money.management.core.account.domain.model.Currency;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ClassPathResource;
import java.nio.file.Files;
import java.util.stream.Stream;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account", description = "API for managing accounts")
public class AccountController {

    private final AccountService accountService;
    private final CurrencyService currencyService;

    public AccountController(AccountService accountService, CurrencyService currencyService) {
        this.accountService = accountService;
        this.currencyService = currencyService;
    }

    @Operation(summary = "List all accounts", description = "Returns a list of all accounts")
    @ApiResponse(responseCode = "200", description = "List of accounts",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = AccountResponse.class)))
    @GetMapping
    public ResponseEntity<List<AccountResponse>> listAccounts() {
        List<Account> accounts = accountService.listAccounts();
        List<AccountResponse> response = accounts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create a new account", description = "Creates a new account with the provided details")
    @ApiResponse(responseCode = "200", description = "Created account",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = AccountResponse.class)))
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Parameter(description = "Account creation request", required = true)
            @Valid @RequestBody AccountRequest request) {
        try {
            Account account = toDomain(request);
            Account created = accountService.createAccount(account);
            return ResponseEntity.ok(toResponse(created));
        } catch (DuplicateAccountNameException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }

    @Operation(summary = "Update an existing account", description = "Updates the account identified by the given ID")
    @ApiResponse(responseCode = "200", description = "Updated account",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = AccountResponse.class)))
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @Parameter(description = "ID of the account to update", required = true)
            @PathVariable Long id,
            @Parameter(description = "Account update request", required = true)
            @Valid @RequestBody AccountRequest request) {
        Account account = toDomain(request);
        Account updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(toResponse(updated));
    }

    @Operation(summary = "Delete an account", description = "Deletes the account identified by the given ID")
    @ApiResponse(responseCode = "204", description = "Account deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @Parameter(description = "ID of the account to delete", required = true)
            @PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get total balance of active accounts", description = "Returns the total balance of all active accounts")
    @ApiResponse(responseCode = "200", description = "Total balance",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = BigDecimal.class)))
    @GetMapping("/total-balance")
    public ResponseEntity<BigDecimal> getTotalBalance() {
        BigDecimal totalBalance = accountService.getTotalBalanceOfActiveAccounts();
        return ResponseEntity.ok(totalBalance);
    }

    @Operation(summary = "Get supported currencies", description = "Returns a list of supported currencies")
    @ApiResponse(responseCode = "200", description = "List of supported currencies",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Currency.class)))
    @GetMapping("/currencies")
    public ResponseEntity<List<Currency>> getSupportedCurrencies() {
        List<Currency> currencies = currencyService.getAllCurrencies();
        return ResponseEntity.ok(currencies);
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
