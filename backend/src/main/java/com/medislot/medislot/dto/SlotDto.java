package com.medislot.medislot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public class SlotDto {

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private boolean available;
    private boolean booked;
    private boolean isBreak;
    private String breakTitle;
    private boolean past;
    private int estimatedTokenNumber;

    public SlotDto() {
    }

    public SlotDto(LocalTime startTime, LocalTime endTime, boolean available, boolean booked, boolean isBreak, String breakTitle, boolean past, int estimatedTokenNumber) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
        this.booked = booked;
        this.isBreak = isBreak;
        this.breakTitle = breakTitle;
        this.past = past;
        this.estimatedTokenNumber = estimatedTokenNumber;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isBooked() {
        return booked;
    }

    public void setBooked(boolean booked) {
        this.booked = booked;
    }

    public boolean isBreak() {
        return isBreak;
    }

    public void setBreak(boolean aBreak) {
        isBreak = aBreak;
    }

    public String getBreakTitle() {
        return breakTitle;
    }

    public void setBreakTitle(String breakTitle) {
        this.breakTitle = breakTitle;
    }

    public boolean isPast() {
        return past;
    }

    public void setPast(boolean past) {
        this.past = past;
    }

    public int getEstimatedTokenNumber() {
        return estimatedTokenNumber;
    }

    public void setEstimatedTokenNumber(int estimatedTokenNumber) {
        this.estimatedTokenNumber = estimatedTokenNumber;
    }
}
