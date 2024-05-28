import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import axios from 'axios';
import TelegramApi from 'node-telegram-bot-api';

const TOKEN_BOT = '6823327756:AAFundEVfZ2-qsvvXBgUt1RL8CLkzbFpdm0';
const bot = new TelegramApi(TOKEN_BOT, { polling: true });
const apiUrl = 'https://fortnite-api.com/v2/shop/br?language=ru';
const HEADER_TEXT = '@fortniteposter_bot';
const BACKGROUND_IMAGE_PATH = './background.jpg';
const chatId = '-1001438227338';

let currentDate; 
let dailyEntries; 
let vbuckIcon;
let firstColor;
let secondColor;
let length;

async function fetchShopData() {
    try {
        const response = await axios.get(apiUrl);
        dailyEntries = response.data.data.date;
        vbuckIcon = response.data.data.vbuckIcon;
        length = response.data.data.featured.entries.length;
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function setBackgroundColor(rarity) {
    switch(rarity) {
        case 'epic': 
            firstColor = '#F4C2FF'; //violet
            secondColor = '#9400D3';
            break;
      
        case 'icon':
            firstColor = '#85F8FF'; //sky
            secondColor = '#1ABFFF';
          break;
        case 'uncommon':
            firstColor = '#A0DE96';  //green
            secondColor = '#38B027';
          break;
        case 'legendary':
            firstColor = '#EAC8AE'; //orange
            secondColor = '#C47436';
          break;
        default:
            firstColor = '#9C9FF2'; //blue
            secondColor = '#2A52BE';
          break;
      }
}

async function createShopImage(shopData) {


    //name bot
    const textX = 50;
    const textY = 100;

    // image settings
    const itemWidth = 500;
    const itemHeight = 500;
    const margin = 40;
    let x = margin;
    let y = textY + 50;
    const bottomMargin = 25;

    let canvasWidth = 4400;
    let rows = Math.ceil(length / 8);
    let canvasHeight = 650 * rows;

    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    try { 
        const backgroundImage = await loadImage(BACKGROUND_IMAGE_PATH);
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } catch (error) {
        console.error('Error loading background image:', error);
        return;
    }    

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px tahoma';
    ctx.fillText(HEADER_TEXT, textX, textY);


    
    for (const item of shopData.featured.entries) {
        if (item.bundle && item.bundle.image) {
            const imageUrl = item.bundle.image;
            const name = item.bundle.name;
            const finalPrice = item.finalPrice;
            const regularPrice = item.regularPrice;
            const shopHistory = item.items[0].shopHistory;
            const rarity = item.items[0].rarity.value;
            let sale;
    
            if (item.banner && item.banner.value) {
                sale = item.banner.value;
            }

            const applyImageEffects = async (imagePath, x, y, width, height) => {
                try {
                    const image = await loadImage(imagePath);
                    const gradientRadius = Math.min(width, height) / 2;
                    const gradientCenterX = x + width / 2;
                    const gradientCenterY = y + height / 2;
                    const gradient = ctx.createRadialGradient(
                        gradientCenterX, gradientCenterY, 0,
                        gradientCenterX, gradientCenterY, gradientRadius
                    );
            
                    setBackgroundColor(rarity);
                    gradient.addColorStop(0, firstColor); // Центр градиента
                    gradient.addColorStop(1, secondColor); // Край градиента
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, width, height);
            
                    ctx.drawImage(image, x, y, width, height);
            
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            };

            const drawSkewedRectangle = (ctx, x, y, width, height) => {
                const arrowWidth = 10;
                ctx.beginPath();
                ctx.moveTo(x - arrowWidth, y);
                ctx.lineTo(x + width - height / 2 - arrowWidth, y);
                ctx.lineTo(x + width - arrowWidth, y + height / 2);
                ctx.lineTo(x + width - height / 2 - arrowWidth, y + height);
                ctx.lineTo(x, y + height);
                ctx.closePath();
            };
        
            try {
                await applyImageEffects(imageUrl, x, y, itemWidth, itemHeight);

                
                ctx.font = 'bold 28px Tahoma';
                sale = sale.toUpperCase();
                let textMetrics = ctx.measureText(sale);
                let textWidth = textMetrics.width;
                const textHeight = 50;
                const padding = 20;

                // Adjust dimensions based on text size
                const textRectWidth = textWidth + padding * 2;
                const textX = x - 10;
                const textYPosition = y - 20;

                // Create skewed rectangle with arrow shape
                drawSkewedRectangle(ctx, textX, textYPosition, textRectWidth, textHeight);

                // Create radial gradient
                ctx.fillStyle = '#FF5349';
                ctx.fill();

                // Draw text border
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4; // Smaller line width
                ctx.stroke();

                // Draw text
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sale, textX + textRectWidth / 2 - 10, textYPosition + textHeight / 2);

                const line = 20;
                ctx.beginPath();
                ctx.moveTo(x, y + itemHeight - 6);
                ctx.lineTo(x + itemWidth, y + itemHeight - 20);
                ctx.lineTo(x + itemWidth, y + itemHeight + line);
                ctx.lineTo(x, y + itemHeight + line);
                ctx.closePath();
                ctx.fillStyle = firstColor;
                ctx.fill();
                
                // Draw additional gray rectangle under the image
                const rectHeight = 40;
                ctx.beginPath();
                ctx.moveTo(x, y + itemHeight + 2);
                ctx.lineTo(x + itemWidth, y + itemHeight - 12);
                ctx.lineTo(x + itemWidth, y + itemHeight + rectHeight);
                ctx.lineTo(x, y + itemHeight + rectHeight);
                ctx.closePath();
                ctx.fillStyle = '#525252';
                ctx.fill();

                function getMaxFontSize(text, maxWidth, initialFontSize, ctx) {
                    let fontSize = initialFontSize;
                    ctx.font = `${fontSize}px monospace`;
                    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
                        fontSize -= 1;
                        ctx.font = `${fontSize}px monospace`;
                    }
                    return fontSize;
                }

                // Calculate maximum font size for the text
                textWidth = itemWidth - 40;
                const maxFontSize = getMaxFontSize(name, textWidth - 50, 40, ctx);
                ctx.fillStyle = 'white';
                ctx.font = `bold ${maxFontSize}px tahoma`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(name.toUpperCase(), x + itemWidth / 2, y + itemHeight + rectHeight / 2);


                // Draw another gray rectangle under the first one
                const secondRectHeight = 30;
                ctx.fillStyle = '#0D0D0D';
                ctx.fillRect(x, y + itemHeight + rectHeight, itemWidth, secondRectHeight);


                function getDaysDifference(shopHistory) {
                    if (shopHistory.length < 1) {
                        return;
                    }
                
                    const lastDate = new Date(shopHistory[shopHistory.length - 1]);
                    const today = new Date();

                    let day;
                    let days;

                    if (apiUrl === 'https://fortnite-api.com/v2/shop/br?language=ru') {
                        day = 'ДЕНЬ';
                        days = 'ДНЕЙ';
                    }
                    else {
                        day = 'DAY';
                        days = 'DAYS';
                    }
                
                    if (shopHistory.length === 1) {
                        const timeDifference = today.getTime() - lastDate.getTime();
                        const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
                        if (daysDifference == 1) {
                            return `${daysDifference} ${day}`;
                        }
                        return `${daysDifference} ${days}`;
                    }
                
                    const secondLastDate = new Date(shopHistory[shopHistory.length - 2]);
                    const timeDifference = lastDate.getTime() - secondLastDate.getTime();
                    const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));

                
                    if (daysDifference == 1) {
                        return `${daysDifference} ${day}`;
                    }
                    return `${daysDifference} ${days}`;
                }

                let dateDifference = getDaysDifference(shopHistory);
                

                if (dateDifference) {
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 26px tahoma';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const priceTextX = x + itemWidth / 6;
                    const priceTextY = y + itemHeight + rectHeight + secondRectHeight / 2;
                    ctx.fillText(dateDifference, priceTextX, priceTextY);
                }

                if (regularPrice > finalPrice) {
                    ctx.fillStyle = '#999999';
                    ctx.font = 'bold 26px tahoma';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const priceTextX = x + itemWidth / 1.6;
                    const priceTextY = y + itemHeight + rectHeight + secondRectHeight / 2;
                    ctx.fillText(regularPrice, priceTextX, priceTextY);
    
                    // Draw diagonal strike-through line from top-left to bottom-right of the text
                    const textWidthMeasured = ctx.measureText(regularPrice).width;
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(priceTextX - textWidthMeasured / 2, priceTextY + 5);
                    ctx.lineTo(priceTextX + textWidthMeasured / 2, priceTextY - 5);
                    ctx.stroke();
                }

                // Replace with the desired text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 26px tahoma';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(finalPrice, x + itemWidth - 110, y + itemHeight + rectHeight + secondRectHeight / 2);

                const vbuck = await loadImage(vbuckIcon);
                ctx.drawImage(vbuck, x + itemWidth - 60, y + itemHeight + rectHeight + secondRectHeight / 2 - 20, 50, 50);

            } catch (error) {
                console.error('Error loading image:', error);
            }
    
            x += itemWidth + margin;
            if (x + itemWidth + margin > canvasWidth) {
                x = margin;
                y += itemHeight + margin + 40 + bottomMargin;
            }
        }
    
    

        //ALL ELSE
        if (item.bundle === null && item.items[0].images) {
            const finalPrice = item.finalPrice;
            const name = item.items[0].name;
            let imageUrl;
            const regularPrice = item.regularPrice;
            const shopHistory = item.items[0].shopHistory;
            const rarity = item.items[0].rarity.value;
            let options;


            if(item.items[0].images.featured) {
                imageUrl = item.items[0].images.featured;
                if (item.items[1] && item.items[1].images) {
                    options = (item.items[1].images) ? item.items[1].images.smallIcon : item.items[1].images.icon;
                }
            }
            if (!item.items[0].images.featured && item.items[0].images.icon) {
                imageUrl = item.items[0].images.icon;
                if (item.items[1] && item.items[1].images) {
                    options = (item.items[1].images) ? item.items[1].images.smallIcon : item.items[1].images.icon;
                }
            }




            const applyImageEffects = async (imagePath, x, y, width, height) => {
                try {
                    const image = await loadImage(imagePath);
                    const gradientRadius = Math.min(width, height) / 2;
                    const gradientCenterX = x + width / 2;
                    const gradientCenterY = y + height / 2;
                    const gradient = ctx.createRadialGradient(
                        gradientCenterX, gradientCenterY, 0,
                        gradientCenterX, gradientCenterY, gradientRadius
                    );
            
                    setBackgroundColor(rarity);
                    gradient.addColorStop(0, firstColor); // Центр градиента
                    gradient.addColorStop(1, secondColor); // Край градиента
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, width, height);
            
                    ctx.drawImage(image, x, y, width, height);
            
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            };

            try {
                await applyImageEffects(imageUrl, x, y, itemWidth, itemHeight);


                const textX = x - 10;
                const textYPosition = y - 20;
                const textWidth = itemWidth - 40;
                const textHeight = 50;
                const rectHeight = 40;

                const line = 20;
                ctx.beginPath();
                ctx.moveTo(x, y + itemHeight - 6);
                ctx.lineTo(x + itemWidth, y + itemHeight - 20);
                ctx.lineTo(x + itemWidth, y + itemHeight + line);
                ctx.lineTo(x, y + itemHeight + line);
                ctx.closePath();
                ctx.fillStyle = firstColor;
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(x, y + itemHeight + 2); // Bottom-left corner of the image
                ctx.lineTo(x + itemWidth, y + itemHeight - 12); // Right point of the skewed rectangle
                ctx.lineTo(x + itemWidth, y + itemHeight + rectHeight); // Right bottom point
                ctx.lineTo(x, y + itemHeight + rectHeight); // Left bottom point
                ctx.closePath();
                ctx.fillStyle = '#525252';
                ctx.fill();


                // Calculate maximum font size for the text
                function getMaxFontSize(text, maxWidth, initialFontSize, ctx) {
                    let fontSize = initialFontSize;
                    ctx.font = `${fontSize}px monospace`;
                    while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
                        fontSize -= 1;
                        ctx.font = `${fontSize}px monospace`;
                    }
                    return fontSize;
                }
                const maxFontSize = getMaxFontSize(name, textWidth - 50, 40, ctx);
                ctx.fillStyle = 'white';
                ctx.font = `bold ${maxFontSize}px tahoma`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(name.toUpperCase(), x + itemWidth / 2, y + itemHeight + rectHeight / 2);


                // Draw another gray rectangle under the first one
                const secondRectHeight = 30;
                ctx.fillStyle = '#0D0D0D';
                ctx.fillRect(x, y + itemHeight + rectHeight, itemWidth, secondRectHeight);


                function getDaysDifference(shopHistory) {
                    if (shopHistory.length < 1) {
                        return;
                    }
                
                    const lastDate = new Date(shopHistory[shopHistory.length - 1]);
                    const today = new Date();

                    let day;
                    let days;

                    if (apiUrl === 'https://fortnite-api.com/v2/shop/br?language=ru') {
                        day = 'ДЕНЬ';
                        days = 'ДНЕЙ';
                    }
                    else {
                        day = 'DAY';
                        days = 'DAYS';
                    }
                
                    if (shopHistory.length === 1) {
                        const timeDifference = today.getTime() - lastDate.getTime();
                        const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
                        if (daysDifference == 1) {
                            return `${daysDifference} ${day}`;
                        }
                        return `${daysDifference} ${days}`;
                    }
                
                    const secondLastDate = new Date(shopHistory[shopHistory.length - 2]);
                    const timeDifference = lastDate.getTime() - secondLastDate.getTime();
                    const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));

                
                    if (daysDifference == 1) {
                        return `${daysDifference} ${day}`;
                    }
                    return `${daysDifference} ${days}`;
                }

                let dateDifference = getDaysDifference(shopHistory);
                

                if (dateDifference) {
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 26px tahoma';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const priceTextX = x + itemWidth / 6;
                    const priceTextY = y + itemHeight + rectHeight + secondRectHeight / 2;
                    ctx.fillText(dateDifference, priceTextX, priceTextY);
                }
                

                if (regularPrice > finalPrice) {
                    ctx.fillStyle = '#999999';
                    ctx.font = 'bold 24px tahoma'; // Change font to monospace
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const priceTextX = x + itemWidth / 2 + 10;
                    const priceTextY = y + itemHeight + rectHeight + secondRectHeight / 2;
                    ctx.fillText(regularPrice, priceTextX, priceTextY);
    
                    // Draw diagonal strike-through line from top-left to bottom-right of the text
                    const textWidthMeasured = ctx.measureText(regularPrice).width;
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(priceTextX - textWidthMeasured / 2, priceTextY + 5); // Start slightly below the text
                    ctx.lineTo(priceTextX + textWidthMeasured / 2, priceTextY - 5); // End slightly below the text
                    ctx.stroke();
                }

                // Replace with the desired text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 26px tahoma';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(finalPrice, x + itemWidth - 110, y + itemHeight + rectHeight + secondRectHeight / 2);

                const vbuck = await loadImage(vbuckIcon);
                ctx.drawImage(vbuck, x + itemWidth - 60, y + itemHeight + rectHeight + secondRectHeight / 2 - 20, 50, 50);

                if (options) {
                    const optionImage = await loadImage(options);
                    ctx.drawImage(optionImage, x, y, 150, 150);
                }

            } catch (error) {
                console.error('Error loading image:', error);
            }

            x += itemWidth + margin;
            if (x + itemWidth + margin > canvasWidth) {
                x = margin;
                y += itemHeight + margin + 40 + bottomMargin; // Добавить высоту картинки и отступ
            }
        }
    }















    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./shop.png', buffer);
}

async function main() {
    const shopData = await fetchShopData();
    if (shopData) {
        await createShopImage(shopData);
        await sendTelegramPhoto('./shop.png');
    }
}

async function sendTelegramPhoto(imagePath) {
    let date = new Date(dailyEntries);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };


    currentDate = date.toLocaleDateString('ru-RU', options);
    const caption = `🛒 Магазин предметов обновлён!\n📅 ${currentDate}\n\n🎁 Получить в-баксы или наборы: @wockeez23\n\n✅Больше 10.000 отзывов: @wockeez23`;
    try {
        await bot.sendPhoto(chatId, imagePath, { caption });
        console.log('Фото успешно отправлено в Telegram');
    } catch (error) {
        console.error('Ошибка при отправке фото в Telegram:', error.message);
    }
}

main();