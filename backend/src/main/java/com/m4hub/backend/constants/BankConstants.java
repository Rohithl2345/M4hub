package com.m4hub.backend.constants;

import java.util.Arrays;
import java.util.List;

public class BankConstants {

    public static final List<BankInfo> SUPPORTED_BANKS = Arrays.asList(
            new BankInfo("SBI", "State Bank of India", "SBIN"),
            new BankInfo("HDFC", "HDFC Bank", "HDFC"),
            new BankInfo("ICICI", "ICICI Bank", "ICIC"),
            new BankInfo("AXIS", "Axis Bank", "UTIB"),
            new BankInfo("PNB", "Punjab National Bank", "PUNB"),
            new BankInfo("BOB", "Bank of Baroda", "BARB"),
            new BankInfo("CANARA", "Canara Bank", "CNRB"),
            new BankInfo("KOTAK", "Kotak Mahindra Bank", "KKBK"),
            new BankInfo("IDBI", "IDBI Bank", "IBKL"),
            new BankInfo("YES", "Yes Bank", "YESB"),
            new BankInfo("INDUSIND", "IndusInd Bank", "INDB"),
            new BankInfo("FEDERAL", "Federal Bank", "FDRL"),
            new BankInfo("BOI", "Bank of India", "BKID"),
            new BankInfo("UNION", "Union Bank of India", "UBIN"),
            new BankInfo("IDFC", "IDFC First Bank", "IDFB"));

    public static class BankInfo {
        private String code;
        private String name;
        private String ifscPrefix;

        public BankInfo(String code, String name, String ifscPrefix) {
            this.code = code;
            this.name = name;
            this.ifscPrefix = ifscPrefix;
        }

        public String getCode() {
            return code;
        }

        public String getName() {
            return name;
        }

        public String getIfscPrefix() {
            return ifscPrefix;
        }
    }
}
