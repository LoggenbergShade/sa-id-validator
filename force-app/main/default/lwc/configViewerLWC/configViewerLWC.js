import { LightningElement, api, wire } from 'lwc';
import getRoutingConfigs from '@salesforce/apex/CampaignRoutingController.getRoutingConfigs';
import getCampaignRoutingSettings from '@salesforce/apex/CampaignRoutingController.getCampaignRoutingSettings';

export default class CampaignRoutingViewer extends LightningElement {
    @api recordId;

    routingConfigs;
    campaignSettings;
    error;

    @wire(getRoutingConfigs, { campaignId: '$recordId' })
    wiredConfigs({ data, error }) {
        if (data) {
            // Map default values for empty fields
            this.routingConfigs = data.map(config => ({
                ...config,
                Current_Lifecycle_Stage__c: config.Current_Lifecycle_Stage__c || 'Not Applicable',
                CM_Scoring_Category__c: config.CM_Scoring_Category__c || 'Not Applicable',
                Products_Owned__c: config.Products_Owned__c || 'Not Applicable',
                Services_In_Use__c: config.Services_In_Use__c || 'Not Applicable',
                Product_Uptake__c: config.Product_Uptake__c || 'Not Applicable',
                Service_Uptake__c: config.Service_Uptake__c || 'Not Applicable',
            }));
        } else if (error) {
            this.error = error;
        }
    }

    @wire(getCampaignRoutingSettings, { campaignId: '$recordId' })
    wiredCampaign({ data, error }) {
        if (data) {
            this.campaignSettings = data;
        } else if (error) {
            this.error = error;
        }
    }

    get hasConfigs() {
        return this.routingConfigs && this.routingConfigs.length > 0;
    }
}