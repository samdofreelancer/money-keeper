package com.personal.money.management.core.account.integration;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.domain.repository.AccountRepository;
import com.personal.money.management.core.account.interfaces.api.dto.AccountRequest;
import com.personal.money.management.core.account.interfaces.api.dto.AccountResponse;
import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AccountIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AccountRepository accountRepository;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/accounts";
        accountRepository.findAll().forEach(account -> accountRepository.deleteById(account.getId()));
    }

    @Test
    void testCreateAndGetAccount() {
        AccountRequest request = new AccountRequest();
        request.setAccountName("Integration Test Account");
        request.setInitBalance(BigDecimal.valueOf(500));
        request.setType(AccountType.CASH);
        request.setCurrency("USD");
        request.setDescription("Integration test description");

        ResponseEntity<AccountResponse> createResponse = restTemplate.postForEntity(baseUrl, request, AccountResponse.class);
        assertEquals(HttpStatus.OK, createResponse.getStatusCode());
        AccountResponse created = createResponse.getBody();
        assertNotNull(created);
        assertEquals("Integration Test Account", created.getAccountName());

        ResponseEntity<AccountResponse[]> listResponse = restTemplate.getForEntity(baseUrl, AccountResponse[].class);
        assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        AccountResponse[] accounts = listResponse.getBody();
        assertNotNull(accounts);
        assertTrue(accounts.length > 0);
    }

    @Test
    void testUpdateAccount() {
        AccountName name = AccountName.of("Old Account");
        Money balance = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account account = new Account(name, balance, AccountType.CASH, "desc");
        account = accountRepository.save(account);
        // Ensure the ID is set before using it in the update URL
        assertNotNull(account.getId(), "Saved account ID should not be null");

        AccountRequest updateRequest = new AccountRequest();
        updateRequest.setAccountName("Updated Account");
        updateRequest.setInitBalance(BigDecimal.valueOf(200));
        updateRequest.setType(AccountType.BANK_ACCOUNT);
        updateRequest.setCurrency("USD");
        updateRequest.setDescription("Updated desc");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AccountRequest> entity = new HttpEntity<>(updateRequest, headers);

        ResponseEntity<AccountResponse> response = restTemplate.exchange(baseUrl + "/" + account.getId(), HttpMethod.PUT, entity, AccountResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        AccountResponse updated = response.getBody();
        assertNotNull(updated);
        assertEquals("Updated Account", updated.getAccountName());
    }

    @Test
    void testDeleteAccount() {
        AccountName name = AccountName.of("Delete Account");
        Money balance = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account account = new Account(name, balance, AccountType.CASH, "desc");
        account = accountRepository.save(account);

        restTemplate.delete(baseUrl + "/" + account.getId());

        assertFalse(accountRepository.findById(account.getId()).isPresent());
    }

    @Test
    void testGetTotalBalance() {
        AccountName name1 = AccountName.of("A1");
        Money balance1 = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account a1 = new Account(name1, balance1, AccountType.CASH, "desc1");
        
        AccountName name2 = AccountName.of("A2");
        Money balance2 = Money.of(BigDecimal.ZERO, CurrencyCode.of("USD"));
        Account a2 = new Account(name2, balance2, AccountType.BANK_ACCOUNT, "desc2");
        
        AccountName name3 = AccountName.of("A3");
        Money balance3 = Money.of(BigDecimal.valueOf(200), CurrencyCode.of("USD"));
        Account a3 = new Account(name3, balance3, AccountType.CREDIT_CARD, "desc3");
        
        accountRepository.save(a1);
        accountRepository.save(a2);
        accountRepository.save(a3);

        ResponseEntity<BigDecimal> response = restTemplate.getForEntity(baseUrl + "/total-balance", BigDecimal.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        BigDecimal total = response.getBody();
        assertNotNull(total);
        assertEquals(0, BigDecimal.valueOf(300).compareTo(total));
    }
}
