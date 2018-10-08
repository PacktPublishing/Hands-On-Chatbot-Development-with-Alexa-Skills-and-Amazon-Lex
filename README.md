# Hands-On Chatbot Development with Alexa Skills and Amazon Lex

<a href="https://www.packtpub.com/web-development/hands-chatbot-development-alexa-skills-and-amazon-lex?utm_source=github&utm_medium=repository&utm_campaign=9781788993487"><img src="https://www.packtpub.com/sites/default/files/9781788993487.png" alt="Hands-On Chatbot Development with Alexa Skills and Amazon Lex" height="256px" align="right"></a>

This is the code repository for [Hands-On Chatbot Development with Alexa Skills and Amazon Lex](https://www.packtpub.com/web-development/hands-chatbot-development-alexa-skills-and-amazon-lex?utm_source=github&utm_medium=repository&utm_campaign=9781788993487), published by Packt.

**Create custom conversational and voice interfaces for your Amazon Echo devices and web platforms**

## What is this book about?
This book will help you to discover important AWS services such as S3 and DyanmoDB. Gain practical experience building end-to-end application workflows using NodeJS and AWS Lambda for your Alexa Skills Kit. You will be able to build conversational interfaces using voice or text and deploy them to platforms like Alexa, Facebook Messenger and Slack.

This book covers the following exciting features:
* Create a development environment using Alexa Skills Kit, AWS CLI, and Node.js
* Build Alexa Skills and Lex chatbots from scratch
* Gain access to third-party APIs from your Alexa Skills and Lex chatbots
* Use AWS services such as Amazon S3 and DynamoDB to enhance the abilities of your Alexa Skills and Amazon Lex chatbots
* Publish a Lex chatbot to Facebook Messenger, Twilio SMS, and Slack
* Create a custom website for your Lex chatbots
* Develop your own skills for Alexa-enabled devices such as the Echo

If you feel this book is for you, get your [copy](https://www.amazon.com/dp/1788993489) today!

<a href="https://www.packtpub.com/?utm_source=github&utm_medium=banner&utm_campaign=GitHubBanner"><img src="https://raw.githubusercontent.com/PacktPublishing/GitHub/master/GitHub.png" 
alt="https://www.packtpub.com/" border="5" /></a>


## Instructions and Navigations
All of the code is organized into folders. For example, Chapter02.

The code will look like the following:
```
return new Promise((resolve, reject) => {
s3.getObject(params, function(err, data) {
if (err) { // an error occurred
reject(handleS3Error(err));
} else { // successful response
console.log(data);
resolve(handleS3Data(data, intentName));
}
});
})
```

**Following is what you need for this book:**
This book is for anyone who wants to be able to build Alexa Skills or Lex chatbots. Whether you want to build them for personal projects or as part of your job, this book will give you all the tools you need. You'll be able to take an idea, build the conversation flow diagrams, test them with user stories, and then build your Alexa Skill or Lex chatbot.

With the following software and hardware list you can run all code files present in the book (Chapter 1-11).

### Software and Hardware List

| Chapter  | Software required                      | OS required                          |
| -------- | ------------------------------------   | ------------------------------------ |
| 2-8      | Node 8.10 or later                     |No specific requirement               |



We also provide a PDF file that has color images of the screenshots/diagrams used in this book. [Click here to download it](https://www.packtpub.com/sites/default/files/downloads/9781788993487_ColorImages.pdf).

### Related products 
* Qlik Sense® Cookbook [[Packt]](https://www.packtpub.com/big-data-and-business-intelligence/qlik-sense-cookbook?utm_source=github&utm_medium=repository&utm_campaign=9781782175148) [[Amazon]](https://www.amazon.com/dp/1785285165)


## Get to Know the Author
**Sam Williams**
qualified with an aerospace engineering master's degree, then became a self-taught software developer while holding down his first job. While traveling, he started to write articles about the tech he was learning about and accrued an audience of readers on Medium and freeCodeCamp.
Currently, Sam works as a lead chatbot developer for the SmartAgent team at MissionLabs, building custom systems for large retailers. His role ensures that he is working with the newest chatbot technologies and is constantly pushing their capabilities.






### Suggestions and Feedback
[Click here](https://docs.google.com/forms/d/e/1FAIpQLSdy7dATC6QmEL81FIUuymZ0Wy9vH1jHkvpY57OiMeKGqib_Ow/viewform) if you have any feedback or suggestions.


