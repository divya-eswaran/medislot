package com.medislot.medislot.dto;

import java.util.ArrayList;
import java.util.List;

public class ConsultationRequest {
    private String symptoms;
    private String diagnosis;
    private String consultationNotes;
    private String treatmentPlan;

    private boolean createPrescription = false;
    private String prescriptionInstructions;
    private List<PrescriptionItemDto> prescriptionItems = new ArrayList<>();

    public ConsultationRequest() {
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getConsultationNotes() {
        return consultationNotes;
    }

    public void setConsultationNotes(String consultationNotes) {
        this.consultationNotes = consultationNotes;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public boolean isCreatePrescription() {
        return createPrescription;
    }

    public void setCreatePrescription(boolean createPrescription) {
        this.createPrescription = createPrescription;
    }

    public String getPrescriptionInstructions() {
        return prescriptionInstructions;
    }

    public void setPrescriptionInstructions(String prescriptionInstructions) {
        this.prescriptionInstructions = prescriptionInstructions;
    }

    public List<PrescriptionItemDto> getPrescriptionItems() {
        return prescriptionItems;
    }

    public void setPrescriptionItems(List<PrescriptionItemDto> prescriptionItems) {
        this.prescriptionItems = prescriptionItems;
    }
}
