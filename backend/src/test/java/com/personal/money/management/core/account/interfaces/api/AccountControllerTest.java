package com.personal.money.management.core.account.interfaces.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.interfaces.api.dto.AccountRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.personal.money.management.core.account.application.AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    private AccountRequest accountRequest;

    @BeforeEach
    void setUp() {
        accountRequest = new AccountRequest();
        accountRequest.setAccountName("Test Account");
        accountRequest.setInitBalance(BigDecimal.valueOf(100));
        accountRequest.setType(AccountType.CASH);
        accountRequest.setCurrency("USD");
        accountRequest.setDescription("Test description");
    }

    @Test
    void testCreateAccount() throws Exception {
        when(accountService.createAccount(any())).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName").value("Test Account"));
    }

    @Test
    void testListAccounts() throws Exception {
        when(accountService.listAccounts()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateAccount() throws Exception {
        when(accountService.updateAccount(any(), any())).thenAnswer(invocation -> invocation.getArgument(1));

        mockMvc.perform(put("/api/accounts/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName").value("Test Account"));
    }

    @Test
    void testDeleteAccount() throws Exception {
        mockMvc.perform(delete("/api/accounts/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetTotalBalance() throws Exception {
        when(accountService.getTotalBalanceOfActiveAccounts()).thenReturn(BigDecimal.valueOf(1000));

        mockMvc.perform(get("/api/accounts/total-balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("1000"));
    }
}
