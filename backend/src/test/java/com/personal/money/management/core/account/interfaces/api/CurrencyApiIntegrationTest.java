package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.domain.model.Currency;
import com.personal.money.management.core.account.domain.repository.CurrencyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.personal.money.management.core.PersonalMoneyManagementApplication;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Currency API.
 * Tests full stack including HTTP, service, and persistence layers.
 */
@SpringBootTest(classes = PersonalMoneyManagementApplication.class)
@AutoConfigureMockMvc
@Transactional
public class CurrencyApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CurrencyRepository currencyRepository;

    @Test
    void getSupportedCurrencies_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/currencies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));
    }
}
