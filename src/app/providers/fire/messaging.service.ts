import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Injectable({
    providedIn: 'root'
})

export class MessagingService {

    currentMessage = new BehaviorSubject(null);
    currentToken: any;
    clientList: any = [];
    selectClientIndex: any;
    selectTopicIndex: any;
    selectSubTopicIndex: any;
    selectedClientSno: any;
    currentPage: any;
    src: any = "'assets/imgs/user-profile.png'"
    constructor(
        private router: Router,private toastrService:ToastrService
    ) {
        this.router.events.subscribe((event: any) => {
            if (event && event.url) {
                this.currentPage = event.url.split('?')[0];
            }
        });
    }

    requestPermission() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./assets/js/firebse-message-sw.js').then((registration) => {
                const messaging = getMessaging();
                getToken(messaging,
                    { vapidKey:"BNpA_q2EO6VoRqEpQyKeGOQ7JUWMFnQMvoOhmE3qfNsMOXWtgKqOb59xYsTmTOyPXDP8d_TfvODPFajP6tYqz8o", serviceWorkerRegistration: registration }).then(
                        (currentToken) => {
                            if (currentToken) {
                                this.currentToken = currentToken;
                                console.log(currentToken);
                            } else {
                                console.log('No registration token available. Request permission to generate one.');
                            }
                        }).catch((err) => {
                            console.log('An error occurred while retrieving token. ', err);
                        });
            });
        }
    }

    // receivedMsg() {
    //     const messaging = getMessaging();
    //     onMessage(messaging, (payload) => {
    //         console.log('Message received. ', payload);
    //     });
    // }
    receivedMsg() {
        const messaging = getMessaging();
        onMessage(messaging, (payload) => {
            console.log(payload)
            if(payload?.data){
                let notification=payload.notification.body
                console.log('Message received. ', payload);
                this.toastrService.success(notification)
            }
            
        });
    }


}
