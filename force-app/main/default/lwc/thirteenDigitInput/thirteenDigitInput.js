// @description        : JavaScript controller for a Lightning Web Component that validates a 13-digit South African Identification Number. It includes real-time validation, error handling, terms consent, and a timeline view of nearby holidays.

import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveIdNumber from '@salesforce/apex/IdNumberController.saveIdNumber';
import getNearbyHolidays from '@salesforce/apex/IdNumberController.getNearbyHolidays';

export default class ThirteenDigitInput extends LightningElement { 
  @api inputValue = '';
  error = ''; 
  isValid = false; 
  isLoading = false; 
  nextBirthdayMessage = ''; 
  holidays = []; 
  acceptedTerms = false; 

  get isSearchDisabled() { 
    // Button is disabled if ID is invalid, if component is loading, or if terms are not accepted
    return !this.isValid || this.isLoading || !this.acceptedTerms; 
  }

  get hasHolidays() { 
    return this.holidays && this.holidays.length > 0;
  }

  handleTermsChange(event) {
    this.acceptedTerms = event.target.checked;
  }

  handleInput(event) { 
    this.inputValue = event.target.value; 
    this.clearMessages(); 
    this.validateInput(); 
  }

  handleChange(event) { 
    this.inputValue = event.target.value; 
    this.validateInput();
  }

  validateInput() { 
    if (!this.inputValue) { 
      this.error = ''; 
      this.isValid = false; 
      return; 
    }

    if (this.inputValue.length !== 13) { 
      this.error = `Please enter exactly 13 digits. Current length: ${this.inputValue.length}`; 
      this.isValid = false;
      return;
    }

    if (!/^\d{13}$/.test(this.inputValue)) { 
      this.error = 'Only digits (0-9) are allowed'; 
      this.isValid = false;
      return;
    }

    this.error = '';
    this.isValid = true;
  }

  handleSearch() {
    if (this.isValid && this.acceptedTerms) {
      this.isLoading = true;
      this.clearMessages();
      this.error = ''; 
      console.log('Search initiated, sending to Apex:', this.inputValue);
      
      saveIdNumber({ idString: this.inputValue, acceptedTerms: this.acceptedTerms })
        .then(() => {
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Success',
              message: 'ID Number processed successfully.',
              variant: 'success'
            })
          );
          
          this.calculateNextBirthday();
        })
        .catch((error) => {
          this.error = 'System Error: ' + (error.body ? error.body.message : error.message);
          console.error('Full Apex Error Details:', error);
          
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Error processing ID',
              message: error.body ? error.body.message : error.message,
              variant: 'error'
            })
          );
        })
        .finally(() => {
          // Note: isLoading is handled in fetchHolidays if the call succeeds, 
          // but we should catch it here if calculateNextBirthday isn't called due to error.
          if (this.error) {
            this.isLoading = false;
          }
        });
    }
  }

  calculateNextBirthday() {
    const mm = parseInt(this.inputValue.substring(2, 4), 10);
    const dd = parseInt(this.inputValue.substring(4, 6), 10);

    const today = new Date();
    const currentYear = today.getFullYear();
    
    let nextBday = new Date(currentYear, mm - 1, dd);
    today.setHours(0, 0, 0, 0);

    if (nextBday < today) {
      nextBday.setFullYear(currentYear + 1);
    }

    const optionsWeekday = { weekday: 'long' };
    const optionsMonth = { month: 'long' };
    
    const weekdayName = nextBday.toLocaleDateString('en-ZA', optionsWeekday);
    const monthName = nextBday.toLocaleDateString('en-ZA', optionsMonth);
    const dayNumber = nextBday.getDate();
    const yearNumber = nextBday.getFullYear();

    this.nextBirthdayMessage = `Your next birthday is ${weekdayName}, ${dayNumber} ${monthName} ${yearNumber}.`;

    this.fetchHolidays(yearNumber, mm, dd);
  }

  fetchHolidays(year, month, day) {
    getNearbyHolidays({ bdayYear: year, bdayMonth: month, bdayDay: day })
      .then((result) => {
        const bdayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        let timelineEvents = result.map(holiday => {
          return {
            id: holiday.name + holiday.holidayDate, 
            name: holiday.name,
            date: holiday.holidayDate,
            contextText: holiday.daysAway === 0 ? 'Happens on your birthday!' :
                         holiday.daysAway > 0 ? `${holiday.daysAway} days after` :
                         `${Math.abs(holiday.daysAway)} days before`,
            iconName: 'standard:event' 
          };
        });

        timelineEvents.push({
          id: 'user-birthday',
          name: '🎂 Your Birthday!',
          date: bdayString,
          contextText: 'The big day!',
          iconName: 'standard:favorite' 
        });

        timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        this.holidays = timelineEvents;
      })
      .catch((error) => {
        console.error('Error fetching holidays', error);
      })
      .finally(() => {
        this.isLoading = false; 
      });
  }

  clearMessages() {
    this.nextBirthdayMessage = '';
    this.holidays = [];
  }

  @api 
  getValue() {
    return this.isValid ? this.inputValue : null; 
  }

  @api 
  clearValue() { 
    this.inputValue = '';
    this.error = '';
    this.isValid = false;
    this.isLoading = false;
    this.acceptedTerms = false;
    this.clearMessages();
  }
}