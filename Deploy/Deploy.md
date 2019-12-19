### Deployment Instructions

Our application will be deployed to AWS environment. The application will run on a remote EC2 instance. 
1. Install ansible on your host machine using any package manager.  
Recommended to use ubuntu and use `apt-get install -y ansible` for installation.
2. Login to AWS and obtain an EC2 machine. 
2. The EC2 should have IAM role access for DynamoDb. 
3. Remote login to the EC2 instance using AWS credentials.  
Alternatively,
Run [ec2-launch.yml](../src/CI-CD/ec2-launch.yml) playbook to provision an ec2 machine.
4. Run ```git clone https://github.ncsu.edu/csc510-fall2019/CSC510-7.git``` on your host machine.
5. Place `.env` file at `CSC510-7/src/CI-CD` containing  
    ```
        USER_SLACK_TOKEN=
        BOT_ID=<@UNTLFGFB8>
        ADMIN_TOKEN=
    ```
    NOTE: Obtain the USER_SLACK_TOKEN from [here](https://api.slack.com/custom-integrations/legacy-tokens). You will find a legacy-token in your slack user account.  
6. Obtain the `hostname`, `ip` and `ssh key` of EC2 machine we created at step 4 and add it to `CSC510-7/src/CI-CD/hosts.yml` file.  
7. Run the ansible-playbook  
```ansible-playbook CSC510/src/CI-CD/deploy.yml -i CSC510/src/CI-CD/hosts.yml```
8. Wait for the Ansible to finish setup.


### Acceptance Testing

1. Navigate to CSC510-7/src
2. Run:
    ``npm install``
3. Run:
    ``node index.js``
4. Now, go to the following link (Slack channel URL): <br>
https://app.slack.com/client/TNTGTLN5U/CNK1N4V5F

5. Once inside the channel, start typing the following commands to
verify the use cases by typing the commands in text box. As shown in the screen shot below, enter 
commands in the textbox at the bottom to start interacting with bot.

    **USE CASE 1: Storage**
    
    - **Set a new storage limit.**
    
       ``@fileninja --setStorageSize 3.5``
    
        Bot Reply: ``New Alert Limit has been set to 3.5 GB``
        
        Enter text/command as shown:

        ![storyboard](./Images/textbox.png)
        
        
    - **Get current storage limit.**
    
       ``@fileninja --getStorageSize``
    
        Bot Reply: ``Current alert limit is 3.5 GB``
        
    - **Trying to set storage grater than 5.0 GB will give an error as Slack doesn't allow storage more than 5.0 GB.**
        ``@fileninja --setStorageSize 6``
        
        Bot Reply: ``Error. Size limit cannot be more than 5.0``
        
    - **Trying to set a storage without numerical value will give an error.**
    
        ``@fileninja --setStorageSize five``
        
        Bot Reply: ``Please enter a number for storage size(in GB).``
        
    **USE CASE 2: Category**
    
    - **Register a category called 'ncsu1'. A category will hold files in it.**
    
        ``@fileninja --registerCategory ncsu1``
    
        Bot Reply: ``Category registered.``
    - **Trying to register a category again will give an error.**
     
        ``@fileninja --registerCategory ncsu1``
    
        Bot Reply:
        ``Category with name ncsu1 already exists in this channel``
    - **Register a category called 'ncsu2'.**
    
        ``@fileninja --registerCategory ncsu2``
    
        Bot Reply: ``Category registered.``
        
    - **Fetch all categories in the channel.**
        
        ``@fileninja --getCategories``
    
        Bot Reply: 
        ``Categories for this channel are: ncsu1,ncsu2``

    - **Add files to a category<br>**
    Click on upload button to upload files, add one or more files with names such as file1.png, file2.png
      In the upload message box, add the below command to add the files to category ncsu1.<br>

        ``@fileninja --addToCategory ncsu1``

        Bot Reply:
        ``File added to category.``

        Adding multiple files to category:

        ![storyboard](./Images/category.png)
    - **Repeat the above for ncsu2. Click upload button and upload the two files as above.**

       ``@fileninja --addToCategory ncsu2``
    - **To see the files uploaded to ncsu1:<br>**

       ``@fileninja --showFiles ncsu1``

        Bot Reply:

        ```
          file1.png: https://files.slack.com/files-pri/TNTGTLN5U-FR4EWH01J/file1.png
          file2.png: https://files.slack.com/files-pri/TNTGTLN5U-FR751GCSJ/file2.png
        ```
    - **To see files in a category which doesn't exist.**

        ``@fileninja --showFiles ncsu3``

        Bot Reply: ``Error: No category with the name ncsu3 exists``

    - **Delete a category in the channel. This will delete all files in that category too.**

        ``@fileninja --deleteCategory ncsu1``

        Bot Reply: ``Files of category ncsu1 have been deleted``

    - **Register a Google drive to use export functionality. (or you can directly move to export functionality and use the commands we have given, as those projects are already created)**  

        ``/registerdrive``  
        A pop up comes, giving you the instructions to follow to Register Google Drive. Here are the instructions in a more elaborate form:
        1. ``Go to Google Developers Console``.  
        Here simply click on link given to you.
        2. ``Select your project or create a new one (and then select it)``

            ![create_project](./Images/create_project.png)
        3. ``In the sidebar on the left, expand APIs & Services > Library``  

            ![create_project](./Images/flow1.png)
        4. ``Find 'Google Drive API' and enable it for your selected project .``  

            ![create_project](./Images/flow2.png)
        5. ``In the sidebar on the left, expand APIs & Services > Credentials``  

            ![create_project](./Images/flow3.png)
        6. ``Click blue "Create credentials" drop down and select "Service account key".``  

            ![create_project](./Images/flow4.png)
        7. ``Select a existing service account or create a new one.``  
        If you select to create a new service account, under 'Role', select 'Project'>'Owner'.

            ![create_project](./Images/flow5.png)
        8. ``Select the 'JSON' key type radio button and click create. A JSON file will be downloaded.``  
        9. ``Now go to your google drive and create a new folder. Share this folder with "client_email". Open the folder and copy the folder-id from the URL to the 'Folder-Id' field below.``  
        Right click on the folder and click on Share. Then paste the 'client_email' given in double quotes in the JSON file you downloaded in step 8.  

            ![create_project](./Images/flow7.png)  

            ![create_project](./Images/flow6.png)  
        Now open the folder and copy the folder-id from the URL to the 'Folder-Id' field provided in the modal. As can be seen below, the last part of the url is the folder-id.

            ![create_project](./Images/flow9.png)
        10. ``Open the JSON file and copy the "private_key" and "client_email" attributes in the following respective fields below``  
        Now copy the "client_email" and "private_key" from the JSON file to the fields provided in the modal.

            ![create_project](./Images/flow8.png)
        Also give a name to the drive. You'll use this name to export files. For example, in the ``@fileninja --exportCategory ncsu2 test`` , 'test' is the name of the drive.

    -   **Export files in ncsu2 to google drive named 'test'**

        ``@fileninja --exportCategory ncsu2 test``

        Bot Reply: ``Files of category 'ncsu2' have been exported.``<br>
        Files get exported to external google drive.
        Note: We have already registered two drives with the names 'test' and 'rb_try' and have mailed the credentials for the respective google accounts to the TAs. Feel free to use these accounts to use our export features. 

    **USE CASE 3: Watermark**
    -   **Register a watermark<br>**
    Upload a suitable .png image to be used as watermark. Select only one image to register as watermark. In the upload message box write the message to
    register this image as watermark.<br>
        ``@fileninja --watermark register wm100``

        Bot Reply: ``Watermark created successfully.``

        Registering a watermark:
        
        ![storyboard](./Images/watermark-register.png)

    - **Watermark a file with image.<br>** This image is a watermark image registered in previous step. Upload a suitable pdf file to be watermarked. In the upload message box write the message to
    add watermark to pdf.
    ``@fileninja --watermark wm100``
       
       Bot Reply: Returns the pdf file with watermarked image.<br>
       ``File watermarked successfully.``
       
      Adding a watermark image to a file:

        ![storyboard](./Images/add-watermark.png)
    
    - **Watermark a file with a text.<br>** As shown in the previous step, upload a suitable pdf file to be watermarked. In the upload message box write the message to
    add text watermark (Script) to pdf.
      ``@fileninja --watermark text Script``

       Bot Reply: Returns the pdf file with watermarked text.<br>
       ``File watermarked successfully.``

       Adding a watermark text to a file:

        ![storyboard](./Images/watermark-text.png)
    - **Fetch all watermarks in the channel.**

        ``@fileninja --watermark list``

       Bot Reply: ``Watermarks for this channel are: wm100``

    - **Register a watermark without a file.<br>**
    
        ``@fileninja --watermark register wm99``

       Bot Reply: ``No file associated with command. Upload a PNG file with command to create watermark.``

    - **Upload a jpg file to register as watermark. It will fail as only .png files are accepted.<br>**
        ``@fileninja --watermark register wm99``

       Bot Reply: ``Wrong format for file . Watermark only accepts .png files``

    - **Without uploading any file, watermark command fails.<br>**
        ``@fileninja --watermark wm100``

       Bot Reply: ``No file associated with command. Upload a PDF file with command watermark the file.`` 

### Deployment Screencast


[Screencast video](https://drive.google.com/open?id=1IZliBJ0fsQbgEFl-Zs3dY2j4Mru1YqcX)

    
### Continuous Integration (CI) Server

We have setup a Jenkins server on EC2 host. A Jenkins job is configured for File Ninja. Every 1 minutes, it polls the repo: https://github.ncsu.edu/csc510-fall2019/CSC510-7. When it detects new changes, it triggers a build that runs all the tests against the latest changes. If build passes, it starts the ansible-playbook that automates the deployment of latest changes to server. <br>

### Jenkins Screencast
[Screencast video](https://drive.google.com/open?id=157F2o-bnDcjwJrL3cr8gL3Spgyi0GMJI)

<p align="center">
<img src="./Images/jenkins.png">
</p>


