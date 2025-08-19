import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ProjectSearchPipe', pure: false })
export class ProjectSearchPipe implements PipeTransform {
  transform(value, args?): Array<any> {
    let searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(row => {
        if (row?.projectName) {
          return row.projectName.search(searchText) !== -1;
        }
        else{
          return row.username.search(searchText) !== -1;
        }
      });
    }
  }
}