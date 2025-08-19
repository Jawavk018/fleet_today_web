import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { NgxPhotoEditorService } from "ngx-photo-editor";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class PhotoService {
  userInfo: any = {};

  constructor(
    private api: ApiService,
    private service: NgxPhotoEditorService,
    private toastService:ToastrService,
  ) {
    let userInfo: any = localStorage.getItem("userInfo");
    this.userInfo = JSON.parse(userInfo);
  }

  updateInfo() {
    let userInfo: any = localStorage.getItem("userInfo");
    this.userInfo = JSON.parse(userInfo);
  }


  onFileChange(e: any, dataType: any = [], callback?: any, maxUpload: number = 1) {
    let files = e.files;
    console.log(files?.length)
    let mediaList: any = [];
    if (maxUpload < files?.length) {
      this.toastService.error(`can't upload more than ${maxUpload} media items`);
      callback(null);
      // let fileListArr: any;
      // for (let i = maxUpload; i < files?.length; i++) {
      //   fileListArr = Array.from(files);
      //   fileListArr.splice(i, 1);
      // }
      // files = fileListArr;
      console.log(files);
    }else{
    for (let file of files) {
      var extension: any = file.name.split(".").pop().toLowerCase();
      if (dataType.includes(file.type.split("/")[1])) {
        let mediaType: any;
        if (file.type.indexOf("image") > -1) {
          mediaType = "Image";
        } else if (file.type.indexOf("video") > -1) {
          mediaType = "Video";
        } else {
          mediaType = "File";
        }
        var bytes = file.size;
        if (bytes == 0) {
          console.log("this file size is too small");
          callback(null);
        } else {
          var size = 20971520;
          if (size < bytes) {
            console.log("this file size is too big");
            callback(null);
          }
        }
        var reader = new FileReader();
        reader.onload = (e) => {

          if (file.type.indexOf("video") > -1) {
            mediaList.push({
              mediaUrl: e.target?.result,
              thumbnailUrl: e.target?.result,
              mediaType: mediaType,
              fileType: "." + extension,
              contentType: file.type,
              fileName: file.name,
            });
            if (files.length == mediaList.length) {
              callback(mediaList);
            }
          } else if (file.type.indexOf("image") > -1) {
            let max_width: any;
            let max_height: any;
              max_width = 700;
              max_height = 250;
            this.generateFromImage(
              e.target?.result,
              max_width,
              max_height,
              1,
              extension,
              null,
              (thumbnailUrl: any) => {
                console.log(files.length == 1)
                mediaList.push({
                  mediaUrl: e.target?.result,
                  thumbnailUrl: thumbnailUrl,
                  mediaType: mediaType,
                  fileType: "." + extension,
                  contentType: file.type,
                  fileName: file.name,
                });
                console.log(files.length == mediaList.length);
                if (files.length == mediaList.length) {
                  console.log(mediaList)
                  callback(mediaList);
                }
              }
            );
          } else {
            mediaList.push({
              mediaUrl: e.target?.result,
              thumbnailUrl: e.target?.result,
              mediaType: mediaType,
              fileType: "." + extension,
              contentType: file.type,
              fileName: file.name,
            });
            if (files.length == mediaList.length) {
              callback(mediaList);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        callback();
        break;
      }
    }
  }
  }

  generateFromImage(
    img: any,
    MAX_WIDTH: any,
    MAX_HEIGHT: any,
    quality: number = 1.0,
    extension: any,
    uploadedBy?: any,
    callback?: any
  ) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();

    image.onload = () => {
      var width: any;
      var height: any;

      if (!uploadedBy) {
        width = image.width;
        height = image.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
      } else {
        width = MAX_WIDTH;
        height = MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, width, height);

      // IMPORTANT: 'jpeg' NOT 'jpg'
      var dataUrl = canvas.toDataURL("image/" + extension, quality);

      let thumbnailBase64 = dataUrl.split(",");
      callback("data:image/jpeg;base64," + thumbnailBase64[1]);
    };
    image.src = img;
  }

  crop(base64: any, type: any, callback: any) {
    let config: any;
    if (type && (type == 'prfoile' || type == 'logo')) {
      config = {
        aspectRatio: 1 / 1,
        autoCropArea: 1,
        roundCropper: true,
        resizeToWidth: 100,
        resizeToHeight: 100,
        imageQuality: 100,
        autoCrop: true,
        viewMode: 2,
        imageSmoothingQuality: "high",
        cropBoxResizable: false,
      };
    } else if (type && type == 'product') {
      config = {
        aspectRatio: 1 / 1,
        autoCropArea: 1,
        roundCropper: true,
        resizeToWidth: 200,
        resizeToHeight: 200,
        imageQuality: 100,
        autoCrop: false,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      };
    } else {
      config = {
        aspectRatio: 16 / 9,
        autoCropArea: 1,
        roundCropper: true,
        imageQuality: 100,
        autoCrop: false,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      };
    }
    this.service.open(base64, config).subscribe((data) => {
      callback(data);
    });
  }

  // crop(base64: any, callback: any) {
  //   this.service.open(base64, {
  //   aspectRatio: 16 / 9,
  //   autoCropArea: 2,
  //   roundCropper: true,
  //   imageQuality: 100,
  //   autoCrop: false,
  //   imageSmoothingEnabled: true,
  //   imageSmoothingQuality: "high",
  //   }).subscribe(data => {
  //   callback(data)
  //   });
  // }

  // openSnackBar(message: string, action: string) {
  //   this._snackBar.open(message, action, {
  //     duration: 5000,
  //   });
  // }
}
