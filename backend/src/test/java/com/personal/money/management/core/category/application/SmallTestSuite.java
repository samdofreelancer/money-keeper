package com.personal.money.management.core.category.application;

import org.junit.platform.suite.api.ExcludeClassNamePatterns;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

/**
 * Test suite for small tests.
 * Includes all tests except those matching *IntegrationTest.
 */
@Suite
@SelectPackages("com.personal.money.management.core")
@ExcludeClassNamePatterns(".*IntegrationTest")
public class SmallTestSuite {
    // This class remains empty, used only as a holder for the above annotations
}
