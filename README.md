# FriendPlace
## Frontend part
Project made by Łukasz Jankowski.

## Prerequisites
- Nodejs
- TypeScript: 4.1.5
- AuctioShop backend part. [link](https://github.com/Lukas-max/Friendbook-backend)

## Build with:
- Angular: 11.2.4
- Angular-CLI: 11.2.4
- Bootstrap: 4.6.0
- Ngx-toastr: 13.2.1
- StompJS: 2.3.3
- Net: 1.0.2
- Angular Matarial progress bar 
- HTML, SCSS
- Font Awesome
- Visual Studio Code

The backend part of the application is right [here](https://github.com/Lukas-max/Friendbook-backend). 

## RUN 
Step 1: Install backend part.  
Step 2: Copy/clone this repo and open in your compiler.   
Step 3: Go to app/environments folder to environment.ts and change backendUrl to your backend url. Like:  `http://localhost:8080'`
Step 4: Run `npm install` and its ready to go.  

## Project purpose and goal
The aim was to develop a functional application, from end to end, that people can use on the internet. First of all the target was to learn storing data, files in folders, developing chat between users, learning websockets, server sent events and user notification about changes in the app, building own lightbox and viewing different kinds of files. The second thing was to use this information and build the web app to better memorize and understand new functions. And least, to style it so it will be comfortable in use and not bad to look.

## App main functions (Fullstack review)
Account:
- User authorization and authentication (with JSON Web Token)
- Register user with email verification
- Reseting password with email verification
- Email and password change by logged users
- Deleting account

File storage:
- Storing files in user file storage
- Deleting files
- Creating folders, deleting folders
- Adding profile photo, deleting the photo
- Each user has a limited storage space
- Informing user on used storage space 

Database:
- storing user data, main feed data, comments, global chat and private chat notifications etc..
- Table generation by sql syntax in schema.sql
- Connection with database using EntityManager and Spring JPA. No Spring Data for this project.
- Database and file storage code connection

Viewing files:
- Viewing added files on the page and/or by using lightbox on file click for a broader view
- Custom made lightbox for viewing all type of files. Images, videos etc..
- Image compression for better performance. The images on the page are viewed in compressed format. Where the images in the lightbox are downloaded in full quality
- Image compression of the profile photo

Main feed (user posts)
- Adding posts by users with text and/or files
- Deleting posts created by users
- General file view and lightbox file view
- Writing comments under each post
- Deleting user comments
- Feed files are stored to global feed directory

WebSocket/Stomp
- Using STOMP for client-server communication
- User login/logout (viewing logged and offline users)
- Global chat beetwen users
- Private p2p chat between users
- Using STOMP to upload information only to logged clients:  
  1) Uploading added posts in the main feed  
  2) Uploading new comments
  3) Upload messages to global chat
  4) Upload messages to private chate between users  
  5) Viewing which user is online

Online/Offline window
- Viewing which users are online when connecting to stomp or offline on disconnect.
- Opening p2p chat window when user is clicked

Chat
- global chat with all users
- Chat window component for user-to-user private chat (private messages are stored encoded in the database)
- Notification if a message is received by other user

## Endopoints and Angular
FriendBook uses endpoints that are documented in the backend part of the app. For more info go [there](https://github.com/Lukas-max/Friendbook-backend).  

## Image compression
The images a user uploads are compressed to lower quality. Ther are two kinds of compression. Compression for image icons on the page is always active and will compress the images to very low quality. For the images that are viewed full size in the lightbox the size of the compression varies. Images that are less than 350KB are not compressed anyhow.  
As for the compression itself its client side in the browser, to unload the server, and it's done through the Canvas object.

```typescript
compressImage(file: File, width: number, quality: number, type: CompressType): void {
        this.compressingFileSubject.next(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = (event: any) => {
                if (type === CompressType.IMAGE_ICON) {
                    const canvas = this._defineCanvas(event, width);
                    this._createBlob(canvas, event, file, quality, CompressType.IMAGE_ICON);
                }

                // etc..
            };
        };
    }
```  
We se here that the blob file and thus the sent file will vary if the image will be an IMAGE_ICON, or IMAGE for the lightbox.  
After the compression we create a file from the blob and send it asynchronously using a Subject.  
```typescript
_createBlob(canvas: HTMLCanvasElement, event: any, file: File, quality: number, type: CompressType): void {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob: Blob) => {
            const newFile: File = new File([blob], file.name, { lastModified: new Date().getTime(), type: blob.type });
            type === CompressType.IMAGE_ICON ? this.compressedImageIconSubject.next(newFile) : this.compressedImageSubject.next(newFile);
        }, 'image/jpeg', quality);
    }
```  

## WebSocket
For websocket connection we use stompjs and socketjs.
```typescript
connect(): void {
        this.socketJs = new SockJS(...);
        this.stomp = Stomp.over(this.socketJs);
        this.stomp.debug = null;

        this.stomp.connect({}, (frame) => {
            this._onConnect();

        }, err => {
            this.toast.onError(err.error.message);
            console.error(err);
            setTimeout(() => this.connect(), 3000);
        });
    }
 ```  
 And _onConnect() we subscribe to different topics, like here: 
 ```typescript
 this.feedSubscription = this.stomp.subscribe(`/topic/feed`, (feed) => {
            const body: FeedModelDto = JSON.parse(feed.body);
            this.feedSubject.next(body);
        });
 ```
