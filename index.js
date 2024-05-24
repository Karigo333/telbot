import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import axios from 'axios';
import sharp from 'sharp';
import fetch from 'node-fetch';
import TelegramApi from 'node-telegram-bot-api';


const TOKEN_BOT = '6823327756:AAFundEVfZ2-qsvvXBgUt1RL8CLkzbFpdm0';
const bot = new TelegramApi(TOKEN_BOT, { polling: true });
const API_URL = 'https://fortnite-api.com/v2/shop/br?language=ru';
const BACKGROUND_IMAGE_PATH = './background.jpg';
const chatId = '-1001438227338';
let currentDate = ''; 
let dailyEntries = ''; 


async function fetchShopData() {
    try {
        const response = await axios.get(API_URL);
        dailyEntries = response.data.data.date;
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


async function createShopImage(shopData) {

    const canvasWidth = 1400;
    const canvasHeight = 1400;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    try { 
        const backgroundImage = await loadImage(BACKGROUND_IMAGE_PATH);
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } catch (error) {
        console.error('Error loading background image:', error);
        return;
    }    

    const headerText = 'КОМПЛЕКТЫ';
    const textX = 30;
    const textY = 50;
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px serif';
    ctx.fillText(headerText, textX, textY);

    

    const itemWidth = 150;
    const itemHeight = 150;
    const margin = 20;
    let x = margin;
    let y = textY+20;

    // const materialInstance = {
    //     images: {
    //         OfferImage: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_bundle_featured_quietpeanuts/offerimage.png",
    //         Texture: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_0_linednotebook/texture.png",
    //         Background: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_bundle_featured_quietpeanuts/background_v1-2.webp"
    //     },
    //     colors: {
    //         Background_Color_A: "#150f2eff",
    //         Background_Color_B: "#89d8ffff",
    //         "Background Inner Gradient": "#00d15aff",
    //         "Background Outer Gradient": "#004433ff",
    //         "Pattern Inner Gradient": "#00f075ff",
    //         "Pattern Outer Gradient": "#003f25ff",
    //         "Sheen Color": "#1fbf60ff"
    //     },
    //     scalings: {
    //         OffsetImage_X: -1,
    //         OffsetImage_Y: 3,
    //         OffsetImage_Y_Compensation: 0,
    //         ZoomImage_Percent: 60,
    //         RefractionDepthBias: 0,
    //         "Background-Balance": 0,
    //         Gradient_Position_X: 50,
    //         Gradient_Position_Y: 33,
    //         Gradient_Size: 66,
    //         Global_Pattern_Opacity: 0.55,
    //         Global_Rotation: 0.35,
    //         Maximum_Texture_Size: 1,
    //         Minimum_Texture_Size: 0.5,
    //         Pattern_Volume: 0.5,
    //         Rotation_Speed: 0.015,
    //         Tiling: 5
    //     }
    // };


    

    for (const item of shopData.featured.entries) {
        if (item.bundle && item.bundle.image) {
            const imageUrl = item.bundle.image;

            const itemName = item.bundle.name;
            const materialInstance = item.newDisplayAsset.materialInstances;
            

            // const materialInstance = {
            //     images: {
            //         OfferImage: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_bundle_featured_quietpeanuts/offerimage.png",
            //         Texture: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_0_linednotebook/texture.png",
            //         Background: "https://fortnite-api.com/images/cosmetics/br/materialinstances/mi_bundle_featured_quietpeanuts/background_v1-2.webp"
            //     },
            //     colors: {
            //         Background_Color_A: "#150f2eff",
            //         Background_Color_B: "#89d8ffff",
            //         "Background Inner Gradient": "#00d15aff",
            //         "Background Outer Gradient": "#004433ff",
            //         "Pattern Inner Gradient": "#00f075ff",
            //         "Pattern Outer Gradient": "#003f25ff",
            //         "Sheen Color": "#1fbf60ff"
            //     },
            //     scalings: {
            //         OffsetImage_X: -1,
            //         OffsetImage_Y: 3,
            //         OffsetImage_Y_Compensation: 0,
            //         ZoomImage_Percent: 60,
            //         RefractionDepthBias: 0,
            //         "Background-Balance": 0,
            //         Gradient_Position_X: 50,
            //         Gradient_Position_Y: 33,
            //         Gradient_Size: 66,
            //         Global_Pattern_Opacity: 0.55,
            //         Global_Rotation: 0.35,
            //         Maximum_Texture_Size: 1,
            //         Minimum_Texture_Size: 0.5,
            //         Pattern_Volume: 0.5,
            //         Rotation_Speed: 0.015,
            //         Tiling: 5
            //     }
            // };

            const applyImageEffects = async (imagePath, x, y, width, height) => {
                try {
                    const image = await loadImage(imagePath);
        
                    if(item.newDisplayAsset && item.newDisplayAsset.materialInstances) {
                        const scaledWidth = width;
                        const scaledHeight = height;
                        const offsetX = -1;
                        const offsetY = 3;
            
                        console.log('yutyutyutyutyu');
                        // Apply background colors and gradients
                        const gradient = ctx.createLinearGradient(x, y, x + scaledWidth, y + scaledHeight);
                        gradient.addColorStop(0, materialInstance.colors.Background_Color_A);
                        gradient.addColorStop(1, materialInstance.colors.Background_Color_B);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(x, y, scaledWidth, scaledHeight);
            
                        const patternGradient = ctx.createRadialGradient(x, y, x + scaledWidth, y + scaledHeight);
                        patternGradient.addColorStop(0, materialInstance.colors["Pattern Inner Gradient"]);
                        patternGradient.addColorStop(1, materialInstance.colors["Pattern Outer Gradient"]);
                        ctx.globalAlpha = materialInstance.scalings.Global_Pattern_Opacity;
                        ctx.fillStyle = patternGradient;
                        ctx.fillRect(x, y, scaledWidth, scaledHeight);
                        ctx.globalAlpha = 1.0;  // Reset alpha to default
            
                        // Draw the image with offset and scaling
                        ctx.drawImage(image, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
                    }
        
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            };

            try {
                await applyImageEffects(imageUrl, x, y, itemWidth, itemHeight);

            } catch (error) {
                console.error('Error loading image:', error);
            }

            x += itemWidth + margin;
            if (x + itemWidth + margin > canvasWidth) {
                x = margin;
                y += itemHeight + margin + 5;
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