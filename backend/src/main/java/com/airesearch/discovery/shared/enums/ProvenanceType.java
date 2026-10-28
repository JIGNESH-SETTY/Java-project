package com.airesearch.discovery.shared.enums;

/**
 * Provenance category to strictly distinguish source-grounded evidence from AI interpretations.
 */
public enum ProvenanceType {
    REPORTED_IN_PAPER,
    AI_INTERPRETATION,
    USER_ANNOTATION,
    USER_ASSERTED
}
