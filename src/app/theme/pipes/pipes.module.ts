import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfilePicturePipe } from './profilePicture/profilePicture.pipe';
import { ChatPersonSearchPipe } from './search/chat-person-search.pipe';
import { UserSearchPipe } from './search/user-search.pipe';
import { TruncatePipe } from './truncate/truncate.pipe';
import { MailSearchPipe } from './search/mail-search.pipe';
import { ProjectSearchPipe } from './search/project-search.pipe';
import { DateAgoPipe } from './date-ago.pipe';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [
        ProfilePicturePipe,
        ChatPersonSearchPipe,
        UserSearchPipe,
        DateAgoPipe,
        TruncatePipe,
        MailSearchPipe,
        ProjectSearchPipe
    ],
    exports: [
        ProfilePicturePipe,
        ChatPersonSearchPipe,
        UserSearchPipe,
        DateAgoPipe,
        TruncatePipe,
        MailSearchPipe,
        ProjectSearchPipe
    ]
})
export class PipesModule { }
