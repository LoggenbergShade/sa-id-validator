// @description        : JavaScript controller for a Lightning Web Component that validates a 13-digit South African Identification Number. It includes real-time validation, error handling, and methods to get and clear the input value.
//  @author            : Shadé Loggenberg
//  @last modified on  : 03-25-2026
//  @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc


import { LightningElement, api } from 'lwc'; // Importing necessary modules from LWC framework

export default class ThirteenDigitInput extends LightningElement { //extending the base class for LWC
  @api inputValue = '';
  error = ''; // used to store error messages for validation feedback
  isValid = false; // track whether the input passes validation

  handleInput(event) { // handleInput method to process user input in real-time. Using JS event object.
    this.inputValue = event.target.value; // Update the inputValue property with the current value of the input field
    this.validateInput(); // Call validateInput to check the current input against validation rules
  }

  handleChange(event) { // handleChange method to process changes when the input field loses focus
    this.inputValue = event.target.value; // Update the inputValue property with the current value of the input field
    this.validateInput();
  }

  validateInput() { // validateInput method to check the input against specific rules for a 13-digit South African ID number
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

  @api
  getValue() {
    return this.isValid ? this.inputValue : null;
  }

  @api
  clearValue() {
    this.inputValue = '';
    this.error = '';
    this.isValid = false;
  }
}
