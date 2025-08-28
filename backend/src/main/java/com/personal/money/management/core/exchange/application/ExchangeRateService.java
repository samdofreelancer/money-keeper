package com.personal.money.management.core.exchange.application;

import com.personal.money.management.core.exchange.infrastructure.persistence.ExchangeRateEntity;
import com.personal.money.management.core.exchange.infrastructure.persistence.ExchangeRateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExchangeRateService {

    @Value("${exchangerates.api.url:https://api.exchangeratesapi.io/v1/latest}")
    private String providerUrl;

    @Value("${exchangerates.api.key:}")
    private String providerKey;

    private static final long CACHE_TTL_MILLIS = 60L * 60L * 1000L; // 1 hour

    private final RestTemplate restTemplate = new RestTemplate();
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final ExchangeRateRepository repository;

    public ExchangeRateService(ExchangeRateRepository repository) {
        this.repository = repository;
    }

    public RatesResponse getLatestRates(String base) {
        String baseUpper = base == null ? "EUR" : base.toUpperCase();
        CacheEntry entry = cache.get(baseUpper);
        long now = Instant.now().toEpochMilli();
        if (entry != null && (now - entry.timestampMs) < CACHE_TTL_MILLIS) {
            return entry.response;
        }

        RatesResponse db = getTodayFromDb(baseUpper);
        if (db != null) {
            cache.put(baseUpper, new CacheEntry(db, now));
            return db;
        }

        // Fetch once without base; provider defaults to base EUR with API key
        RatesResponse fetched = fetchFromProvider();
        if (fetched != null && fetched.getRates() != null) {
            // Persist with fetched base (likely EUR)
            persistRates(fetched.getBase(), fetched);
            // Also normalize and return requested base
            RatesResponse normalized = normalizeToBase(fetched, baseUpper);
            cache.put(baseUpper, new CacheEntry(normalized, now));
            return normalized;
        }

        RatesResponse fallback = new RatesResponse();
        fallback.setBase(baseUpper);
        Map<String, Double> m = new HashMap<>();
        m.put(baseUpper, 1.0);
        fallback.setRates(m);
        cache.put(baseUpper, new CacheEntry(fallback, now));
        return fallback;
    }

    private RatesResponse fetchFromProvider() {
        try {
            String url = providerUrl + (providerKey == null || providerKey.isEmpty() ? "" : ("?access_key=" + providerKey));
            ResponseEntity<RatesResponse> resp = restTemplate.getForEntity(url, RatesResponse.class);
            return resp.getBody();
        } catch (Exception e) {
            return null;
        }
    }

    private RatesResponse normalizeToBase(RatesResponse data, String baseUpper) {
        if (data == null || data.getRates() == null) return null;
        String fetchedBase = data.getBase() == null ? "EUR" : data.getBase().toUpperCase();
        if (baseUpper.equals(fetchedBase)) return data;
        Double baseRate = data.getRates().get(baseUpper);
        if (baseRate == null || baseRate == 0) return data;
        Map<String, Double> converted = new HashMap<>();
        for (Map.Entry<String, Double> en : data.getRates().entrySet()) {
            converted.put(en.getKey(), en.getValue() / baseRate);
        }
        RatesResponse r = new RatesResponse();
        r.setBase(baseUpper);
        r.setRates(converted);
        return r;
    }

    private RatesResponse getTodayFromDb(String baseUpper) {
        LocalDate today = LocalDate.now();
        List<ExchangeRateEntity> rows = repository.findByBaseAndRateDate(baseUpper, today);
        if (rows == null || rows.isEmpty()) {
            // If requested base not present in DB yet, try any base for today and normalize
            List<ExchangeRateEntity> anyBaseRows = repository.findByRateDate(today);
            if (anyBaseRows == null || anyBaseRows.isEmpty()) return null;
            String fetchedBase = anyBaseRows.get(0).getBase();
            RatesResponse tmp = new RatesResponse();
            tmp.setBase(fetchedBase);
            Map<String, Double> tmpRates = new HashMap<>();
            for (ExchangeRateEntity e : anyBaseRows) tmpRates.put(e.getSymbol(), e.getRate());
            tmp.setRates(tmpRates);
            return normalizeToBase(tmp, baseUpper);
        }
        RatesResponse r = new RatesResponse();
        r.setBase(baseUpper);
        Map<String, Double> map = new HashMap<>();
        for (ExchangeRateEntity e : rows) {
            map.put(e.getSymbol(), e.getRate());
        }
        r.setRates(map);
        return r;
    }

    @Transactional
    public void persistRates(String baseUpper, RatesResponse data) {
        if (data == null || data.getRates() == null) return;
        LocalDate today = LocalDate.now();
        for (Map.Entry<String, Double> en : data.getRates().entrySet()) {
            ExchangeRateEntity e = new ExchangeRateEntity();
            e.setBase(baseUpper);
            e.setSymbol(en.getKey());
            e.setRate(en.getValue());
            e.setRateDate(today);
            repository.save(e);
        }
    }

    @Transactional
    public void refreshDaily() {
        RatesResponse fetched = fetchFromProvider();
        if (fetched != null && fetched.getRates() != null) {
            // Persist for fetched base
            String fetchedBase = fetched.getBase() == null ? "EUR" : fetched.getBase().toUpperCase();
            persistRates(fetchedBase, fetched);
            // Also persist normalized copies for selected popular bases to speed lookups
            for (String base : new String[] {"EUR", "USD", "VND"}) {
                RatesResponse normalized = normalizeToBase(fetched, base);
                if (normalized != null) {
                    persistRates(base, normalized);
                    cache.put(base, new CacheEntry(normalized, Instant.now().toEpochMilli()));
                }
            }
        }
    }

    private static class CacheEntry {
        final RatesResponse response;
        final long timestampMs;
        CacheEntry(RatesResponse r, long t) { this.response = r; this.timestampMs = t; }
    }

    public static class RatesResponse {
        private String base;
        private Map<String, Double> rates;
        public String getBase() { return base; }
        public void setBase(String base) { this.base = base; }
        public Map<String, Double> getRates() { return rates; }
        public void setRates(Map<String, Double> rates) { this.rates = rates; }
    }
} 