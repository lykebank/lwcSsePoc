import { LightningElement, track } from 'lwc';

export default class SsePOC extends LightningElement {
    @track messages = [];

    sourceOptions = [
        {
            label: 'W3Schools',
            value: 'https://www.w3schools.com/html/demo_sse.php'
        },
        {
            label: 'Postman',
            value: 'https://www.postman-echo.com/server-events'
        },
        {
            label: 'SSE Dev',
            value: 'https://sse.dev/test'
        }
    ];
    sourceUrl;
    handleSourceChange(event){
        this.sourceUrl = event.detail.value;
    }

    connectedCallback(){
        
    }

    get cardTitle(){
        return `Messages (${this.messages.length})`;
    }

    source;
    setUpConnection(){
        //const source = new EventSource('https://www.w3schools.com/html/demo_sse.php'); //didn't work
        //const source = new EventSource('https://www.postman-echo.com/server-events'); //didn't work
        this.closeConnection(true);
        this.source = new EventSource(this.sourceUrl, {withCredentials: this.refs.includeCredentialsToggle.checked === true});
        this.source.onmessage = (e) => {
            this.handleSSEMessage(e);
        };
        this.source.onerror = (e) => {
            this.handleSSEError(e);
        }
    }
    closeConnection(clear = false){
        if(this.source){
            this.source.close();
        }
        if(clear){
            this.source = undefined;
        }
    }

    get sourceWithCredentials(){
        return this.source?.withCredentials;
    }
    get sourceReadyState(){
        return this.source?.readyState;
    }

    handleSSEMessage(e){
        this.messages.push({
            i: this.messages.length,
            data: e.data,
            id: e.id
        });
        console.debug(e.data);
    }
    error;
    handleSSEError(error){
        this.error = error;
        console.error(error);
        this.closeConnection();
        this.listening = false;
    }

    listening = false;
    toggleListeningOnClick(){
        if(!this.listening){
            this.setUpConnection();
        }
        else{
            this.closeConnection();
        }
        this.listening = !this.listening;
    }
    get disableStartPauseButton(){
        return !this.sourceUrl;
    }
    get startPauseLabel(){
        return this.listening ? 'Pause'
            : this.messages.length > 0 ? 'Resume' : 'Start';
    }
    get startPauseIconName(){
        return this.listening ? 'utility:pause' : 'utility:play';
    }

    get enableClearButton(){
        return this.messages.length > 0 || this.error;
    }

    get disableClearButton(){
        return this.listening || !this.enableClearButton;
    }
    clearOnClick(){
        this.clearMessages();
        this.closeConnection(true);
    }

    clearMessages(){
        this.messages = [];
        this.error = undefined;
    }
}