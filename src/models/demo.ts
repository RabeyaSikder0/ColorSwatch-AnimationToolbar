import { AppImage } from "../assets";

export type ListType ={
    name: string;
    description: string;
    background: any;
    screenName: string;
};

export const DEMOS: ListType[]=[
    {
        name: 'Animated Toolbar',
        description: 'A custom palyful, interactive',
        background: AppImage.animated_toolbar,
        screenName: 'toolbar'
    }
];

export const TOOLBAR: ListType[]=[
    {
        name: 'Toolbar Animated',
        description: 'Toolbar implementation',
        background: AppImage.animated_toolbar,
        screenName: 'toolbar-animated'
    },
    {
        name: 'Toolbar Reanimated',
        description:'Toolbar implementation',
        background: AppImage.animated_toolbar,
        screenName: 'toolbar-reanimated'
    }
]