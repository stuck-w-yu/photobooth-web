// utils/layouts.js

export const COLLAGE_SIZE = 800; 

export const LAYOUT_OPTIONS = {
    L_1_SINGLE: {
        name: "1 Foto - Polaroid Besar",
        maxPhotos: 1,
        template: '/frames/template_1_single_modern.svg', 
        map: [
            { x: 110, y: 110, w: 580, h: 440 }
        ]
    },
    L_4_SQUARE: {
        name: "4 Foto - Polaroid Modern",
        maxPhotos: 4,
        template: '/frames/template_4_square_modern.svg', 
        map: [
            { x: 35, y: 35, w: 330, h: 280 },
            { x: 435, y: 35, w: 330, h: 280 },
            { x: 35, y: 435, w: 330, h: 280 },
            { x: 435, y: 435, w: 330, h: 280 }
        ]
    }
};