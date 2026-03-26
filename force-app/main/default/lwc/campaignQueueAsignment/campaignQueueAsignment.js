import { LightningElement, wire, track, api } from 'lwc';
import getMappingsWithUsers from '@salesforce/apex/CampaignQueueMappingController.getMappingsWithUsers';

export default class CampaignQueueAssignment extends LightningElement {
    @api recordId;

    @track data = [];
    @track error;

    columns = [
        { label: 'Campaign Name', fieldName: 'campaignName' },
        { label: 'Queue Name', fieldName: 'queueName' },
        { label: 'Queue Members', fieldName: 'userList' }
    ];

    // Only call Apex if recordId exists
    @wire(getMappingsWithUsers, { campaignId: '$recordId' })
    wiredMappings({ error, data }) {
        if (!this.recordId) {
            this.data = [];
            this.error = undefined;
            return;
        }

        if (data) {
            this.data = data.map(row => ({
                ...row,
                userList: row.users.join(', ')
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = [];
        }
    }

    get hasData() {
        return this.recordId && this.data && this.data.length > 0;
    }

    get isRecordPage() {
        return !!this.recordId;
    }
}