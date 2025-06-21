package com.personal.money.management.core.category.application;

import org.junit.platform.suite.api.IncludeClassNamePatterns;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

/**
 * Test suite for medium tests (integration tests).
 * Includes only tests matching *IntegrationTest.
 */
@Suite
@SelectPackages("com.personal.money.management.core")
@IncludeClassNamePatterns(".*IntegrationTest")
public class MediumTestSuite {
    // This class remains empty, used only as a holder for the above annotations
}
