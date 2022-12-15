# 🤖 The IPU Ranklist Telegram Bot

[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=102)](https://github.com/ankushgarg1998/ipuranklist-bot)  &nbsp;&nbsp;
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/ankushgarg1998/ipuranklist-bot)  &nbsp;&nbsp;
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ankushgarg1998/ipuranklist-bot)


In very simple words, the [**IPU Ranklist Bot**]((https://web.telegram.org/#/im?p=@ipuranklist_bot)) is a [telegram bot](https://telegram.org/blog/bot-revolution) that notifies you about updates on the [GGSIPU website](http://ipu.ac.in/), so that you don't have to reload it a thousand times a day waiting for a result, datesheet or circular.

[Click Here](https://web.telegram.org/#/im?p=@ipuranklist_bot) to instantly start using the bot.

<img src="./screenshots/1.jpg" alt="screenshot" width="250px"/>&nbsp;&nbsp;&nbsp;&nbsp;
<img src="./screenshots/2.jpg" alt="screenshot" width="250px"/>&nbsp;&nbsp;&nbsp;&nbsp;
<img src="./screenshots/3.jpg" alt="screenshot" width="250px"/>


### It's exactly what I needed. How does it work?
- Subscribe to the datesheet/results/circulars page, depending on whichever you're expecting to be announced soon.
- The bot will send you a message, whenever there is any update on that particular page on the website.
- This message will contain details of all the new documents that were uploaded on the GGSIPU site, so that you can know whether or not the document you're expecting was uploaded.
- Unsubscribe whenever you want, so that you're not bugged by all the new updates.
- That's it.

### I have telegram installed. How do I get this bot?
If you're reading this on a mobile phone, [click here](https://web.telegram.org/#/im?p=@ipuranklist_bot). Else click on the search icon on the top right corner in the Telegram app and look for "IPU Ranklist Bot". 


### What the hell is Telegram even? How do I get it?
To simply put, Telegram is a messaging application on steroids. If you're thinking it's like Whatsapp? Hell no. Telegram makes WhatsApp look like a bag of dried chickpeas. You can easily download the Telegram app from the App Store of your mobile device.

---

## FEATURES
- Check recent Results/ Datesheets/ Cirulars on the website.
- Subscribe to the Results/ Datesheets/ Cirulars page. So you'll be notified whenever a new file is uploaded on that page.
- Unsubscribe to stop receiving further updates.

## COMMANDS
Control the IPU Ranklist Bot by sending these commands:
| Command                            | Function                                                 |
|:-----------------------------------|:---------------------------------------------------------|
| **/help**                          | Gets a list of commands, for when you're stuck.          |


### Fetching last 10 uploads
| Command                            | Function                                                 |
|:-----------------------------------|:---------------------------------------------------------|
| **/results**                       | To fetch the last 10 results uploaded.                   |
| **/datesheets**                    | To fetch the last 10 datesheets uploaded.                |
| **/circulars**                     | To fetch the last 10 circulars uploaded.                 |

### Subscribing to updates of a page.
| Command                            | Function                                                 |
|:-----------------------------------|:---------------------------------------------------------|
| **/subscriberesults**              | To subscribe to result updates.                          |
| **/subscribedatesheets**           | To subscribe to datesheet updates.                       |
| **/subscribecirculars**            | To subscribe to circular updates.                        |

### Unsubscribe from updates of a page.
| Command                            | Function                                                 |
|:-----------------------------------|:---------------------------------------------------------|
| **/unsubscriberesults**            | To unsubscribe from results.                             |
| **/unsubscribedatesheets**         | To unsubscribe from datesheets.                          |
| **/unsubscribecirculars**          | To unsubscribe from circulars.                           |


## TECH
It is developed in [NodeJS](https://nodejs.org/en/) using the awesome [Telegraf](https://telegraf.js.org) and [node-cron](https://github.com/node-cron/node-cron) libraries. It uses MongoDB database and is live on Telegram as [@ipuranklist_bot](https://web.telegram.org/#/im?p=@ipuranklist_bot). 


<hr>

## CONTRIBUTE
- Raise an issue to specify what you'd like to work on. Or mention that you're working on an existing issue.
- Fork the repository
- Commit your code
- Create a Pull Request

[MIT Licence](https://github.com/ankushgarg1998/ipuranklist-bot/blob/master/LICENSE) © [Ankush Garg](https://ankushgarg1998.github.io/)
