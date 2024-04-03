import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import {
    SafeAreaView,
    Animated,
    Pressable,
    View,
    StyleSheet,
    Easing,
    GestureResponderEvent,
    PanResponder,
    StatusBar,
    useColorScheme
} from 'react-native';

import {
   
    useSafeAreaInsets
} from 'react-native-safe-area-context';

import {
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

import {
    Gesture,
    GestureDetector,
    GestureUpdateEvent,
    PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { SFSymbol } from 'react-native-sfsymbols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BUTTONS_LIST } from './buttons';
import { BackButton } from '../components';
import Config from '../Config';
import * as theme from '../theme';

interface PaletteProp {
    colors: string[],
    index: number;
    activeGesture: SharedValue<number>;
    activeColor: string;
    onColorPress: (color: string) => void;
}

const ITEM_HEIGHT_COLOR = 250;
const ITEM_WIDTH = 60;

const COLOR_PALETTE = [
    ['rgb(195, 107, 88)', 'rgb(216, 160, 164)', 'rgb(209, 178, 195)'],
    ['rgb(202, 106, 123)', 'rgb(224, 156, 192)', 'rgb(212, 171, 215)'],
    ['rgb(187, 122, 248)', 'rgb(212, 172, 250)', 'rgb(216, 191, 251)'],
    ['rgb(118, 134, 247)', 'rgb(157, 183, 259)', 'rgb(168, 198, 250)'],
    ['rgb(103, 130, 169)', 'rgb(182, 208, 237)', 'rgb(195, 218, 246)'],
    ['rgb(0, 0, 0)', 'rgb(64, 68, 88)', 'rgb(122, 128, 159)'],
];


// const PaletteItem: React.FC<PaletteProp> = ({
//     colors,
//     index,
//     activeGesture,
//     activeColor,
//     onColorPress
// }) => {
//     const viewStyle = useAnimatedStyle(() => {
//         const angle = (activeGesture.value / (COLOR_PALETTE.length - 1)) * index;
//         return {
//             transform: [
//                 { translateY: 100 },
//                 { rotate: withSpring(`${angle}deg`, { damping: 100, mass: 0.4 }) },
//                 { translateY: -100 }
//             ]
//         }
//     }, [activeGesture]);

//     const onAnchorPress = useCallback(
//         () => (activeGesture.value = activeGesture.value === 0 ? 90 : 0),
//         [activeGesture],
//     );

//     return (
//         <View style={[styles.paletteContainer, styles.paletteSize, viewStyle]}>
//             <Pressable
//                 style={[
//                     styles.colorItemCommon,
//                     styles.colorTop,
//                     { backgroundColor: colors[0] },
//                 ]}
//                 onPress={() => onColorPress(colors[0])}
//             />
//             <Pressable
//                 style={[
//                     styles.colorItemCommon,
//                     styles.colorMiddle,
//                     { backgroundColor: colors[1] },
//                 ]}
//                 onPress={() => onColorPress(colors[1])}
//             />
//             <Pressable
//                 style={[styles.colorItemCommon, { backgroundColor: colors[2] }]}
//                 onPress={() => onColorPress(colors[2])}
//             />
//             <Pressable style={styles.anchorContainer} onPress={onAnchorPress}>
//                 <View style={[styles.anchorOuterCircle, { borderColor: activeColor }]}>
//                     <View
//                         style={[
//                             styles.anchorInnerCircle,
//                             { backgroundColor: activeColor, borderColor: activeColor }
//                         ]}
//                     />
//                 </View>
//             </Pressable>
//         </View>
//     )
// }

interface ButtonType {
    item: (typeof BUTTONS_LIST[0]);
    index: number;
    offset: Animated.Value;
    activeY: Animated.Value;
}

const ITEM_HEIGHT = 50 + 16;
const TOOLBAR_HEIGHT = ITEM_HEIGHT * 7 + 16;
const TOTAL_HEIGHT = ITEM_HEIGHT * BUTTONS_LIST.length + 16;
const endScrollLimit = TOTAL_HEIGHT - TOOLBAR_HEIGHT;

const Button: React.FC<ButtonType> = ({ item, index, offset, activeY }) => {
    const itemEndPos = (index + 1) * ITEM_HEIGHT + 8;
    const itemStartPos = itemEndPos - ITEM_HEIGHT;
    const btnWidth = useRef(new Animated.Value(50));
    const translateX = useRef(new Animated.Value(0));
    const btnScale = useRef(new Animated.Value(1));
    const iconScale = useRef(new Animated.Value(1));
    const titleOpacity = useRef(new Animated.Value(0));
    const topForRb = useRef(new Animated.Value(0));

    const isItemOutOfView = useRef(false);
    const scrollOffset = useRef(0);

    offset?.addListener(e => {
        scrollOffset.current = e.value;
        const isOut = itemEndPos < e.value || itemStartPos > e.value + TOOLBAR_HEIGHT;

        if (e.value < 0) {
            topForRb.current.setValue((index + 1) * Math.abs(e.value / 10));
        } else if (e.value > endScrollLimit) {
            topForRb.current.setValue(
                -(BUTTONS_LIST.length - index + 1) *
                Math.abs((e.value - endScrollLimit) / 10)
            );
        } else if (e.value === 0 || e.value === endScrollLimit) {
            topForRb.current.setValue(0);
        }

        if ((isOut && !isItemOutOfView.current) || (!isOut && isItemOutOfView)) {
            isItemOutOfView.current = isOut;
            Animated.timing(btnScale.current, {
                toValue: isOut ? 0.4 : 1,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    });

    const isItemActive = useRef(false);

    activeY?.addListener(e => {
        const pressedPoint = e.value + scrollOffset.current;
        const isValid =
            e.value != 0 &&
            pressedPoint >= itemStartPos &&
            pressedPoint < itemEndPos;

        if ((isValid && !isItemActive.current) || (!isValid && isItemActive.current)) {
            isItemActive.current = isValid;
            playAnimation();
        }
    });

    const playAnimation = () => {
        Animated.parallel([
            Animated.spring(btnWidth.current, {
                toValue: isItemActive.current ? 140 : 50,
                damping: 15,
                useNativeDriver: false,
            }),
            Animated.timing(translateX.current, {
                toValue: isItemActive.current ? 55 : 0,
                duration: 250,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(btnScale.current, {
                toValue: isItemActive.current ? 1.2 : 1,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(iconScale.current, {
                toValue: isItemActive.current ? 0.8 : 1,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(titleOpacity.current, {
                toValue: isItemActive.current ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start();
    };
    return (
        <Animated.View style={{ transform: [{ translateX: translateX.current }] }}>
            <Animated.View
                style={[styles.buttonContainer,
                {
                    width: btnWidth.current,
                    transform: [{ scale: btnScale.current }],
                    top: topForRb.current,
                    backgroundColor: item.color
                }

                ]}>
                <Animated.View style={{ transform: [{ scale: iconScale.current }] }}>
                    {Config.isIos ? (
                        <SFSymbol
                            name={item.icon}
                            weight='semibold'
                            scale='large'
                            color="white"
                            size={20}
                            resizeMode="center"
                            multicolor={false}
                            style={{ padding: 12 }}
                        />
                    ) : (
                        <Icon name={item.icon} color="white" size={24} />
                    )}
                </Animated.View>
                <Animated.Text style={[
                    styles.buttonTitle,
                    { opacity: titleOpacity.current },
                    Config.isWindows && {
                        transform: [{ scale: iconScale.current }]
                    }
                ]}
                    selectable={false}
                >
                    {item.title}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    )
};





const ToolbarMacos = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const insets = useSafeAreaInsets();
    const [isLongPressed, setLongPressed] = useState(false);
    const listRef = useRef<View | null>(null);
    const listViewOffset = useRef<number>(0);
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
    const activeY = useRef(new Animated.Value(0)).current;
    const scrollOffset = useRef(new Animated.Value(0)).current;

    const onTouchStart = useCallback(
        (e: GestureResponderEvent) => {
            const pageY = e.nativeEvent.pageY;
            longPressTimeout.current = setTimeout(() => {
                setLongPressed(() => true);
                activeY.setValue(pageY - listViewOffset.current);
            }, 200);
        },
        [activeY],
    );

    const onTouchMove = useCallback(
        (e: GestureResponderEvent) => {
            if (isLongPressed) {
                isLongPressed &&
                    activeY.setValue(e.nativeEvent.pageY - listViewOffset.current);
            }
        },
        [activeY, isLongPressed],

    )

    const onTouchEnd = useCallback(() => {
        longPressTimeout.current && clearTimeout(longPressTimeout.current);
        activeY.setValue(0);
        setLongPressed(() => false);
    }, [activeY]);

    const pan = useMemo(
        () => PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: onTouchStart,
            onPanResponderMove: onTouchMove,
            onPanResponderRelease: onTouchEnd,
        }),
        [onTouchStart, onTouchMove, onTouchEnd],
    );

    let [panResponder, setPanResponder] = useState(pan);

    useEffect(() => {
        setPanResponder(pan);
    }, [pan]);



    // const activeGesture = useSharedValue(0);
    // const [activeColor, setActivecolor] = useState('rgb(64, 68, 88)');

    // const calculateDegree = useCallback(
    //     (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    //         'worklet';
    //         let degree = Math.atan2(ITEM_HEIGHT_COLOR - e.y, e.x - ITEM_WIDTH / 2) * (180 / Math.PI);
    //         degree < -90 && (degree = degree + 360);
    //         return 90 - degree;
    //     },
    //     []
    // );

    // const dragGesture = Gesture.Pan()
    //     .onStart(e => {
    //         activeGesture.value = calculateDegree(e);
    //     })
    //     .onUpdate(e => {
    //         activeGesture.value = calculateDegree(e);
    //     })
    //     .onEnd(() => {
    //         activeGesture.value = activeGesture.value > 90 ? 90 : 0;
    //     });


    return (
        <>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            // backgroundColor={theme.toolbar(isDarkMode).bg}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <BackButton />
                <View>
                    <View
                        style={[styles.toolbarView, themeStyles(isDarkMode).toolbarView]}
                    />
                    <View
                        style={styles.buttonListView}
                        {...(Config.isWeb && panResponder.panHandlers)}
                        {...{ onTouchStart, onTouchMove, onTouchEnd }}
                        onTouchCancel={onTouchEnd}
                        onLayout={() =>
                            listRef.current?.measure((_x, _y, _w, _h, _pageX, pageY) => {
                                listViewOffset.current = pageY + insets.top;
                            })
                        }
                        ref={listRef}
                    >
                        <Animated.FlatList
                            contentContainerStyle={{ padding: 8 }}
                            onScroll={Animated.event(
                                [{
                                    nativeEvent: {
                                        contentOffset: { y: scrollOffset }
                                    }
                                }],
                                { useNativeDriver: false },
                            )}
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            canCancelContentTouches={!isLongPressed}
                            scrollEnabled={Config.isIos || !isLongPressed}
                            data={BUTTONS_LIST}
                            renderItem={({ item, index }) => (
                                <Button offset={scrollOffset} {...{ item, index, activeY }} />
                            )}
                            keyExtractor={(item, index) => `${item.title}_${index}`}
                        />

                    </View>


                    {/* <View style={{ flex: 1, margin: 40, justifyContent: 'flex-end' }}>
                        <GestureDetector gesture={dragGesture}>
                            <View style={styles.paletteSize}>
                                {COLOR_PALETTE.map((colors, index) => (
                                    <PaletteItem
                                        key={index}
                                        onColorPress={setActivecolor}
                                        {...{ activeColor, colors, index, activeGesture }}
                                    />
                                ))}
                            </View>
                        </GestureDetector>
                    </View> */}
                </View>
            </SafeAreaView>
        </>
    )
}


const styles = StyleSheet.create({
    toolbarView: {
        width: 50 + 16,
        height: TOOLBAR_HEIGHT,
        backgroundColor: 'white',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        borderRadius: 12,
        marginHorizontal: 24,
        marginVertical: 40,
        elevation: 32,
    },
    buttonListView: {
        position: 'absolute',
        height: TOOLBAR_HEIGHT,
        width: '100%',
        marginHorizontal: 24,
        marginVertical: 40,
        elevation: 32,
    },

    buttonContainer: {
        width: 50,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginVertical: 8,
        padding: 12,
    },

    buttonTitle: {
        marginLeft: 12,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    colorSwatch: {
        flexDirection: 'row',
        marginHorizontal: 118


    },
    paletteSize: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT_COLOR
    },
    paletteContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        padding: 4,
        borderRadius: 20,
    },
    colorItemCommon: {
        flex: 1,
        width: '100%',
        borderRadius: 8
    },
    colorTop: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginBottom: 4,
    },
    colorMiddle: {
        marginBottom: 4
    },

    anchorContainer: {
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    anchorOuterCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    anchorInnerCircle: {
        width: 16,
        height: 16,
        borderRadius: 8
    }


})



const themeStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            // backgroundColor: theme.toolbar(isDarkMode).bg,
        },
        toolbarView: {
            // backgroundColor: theme.toolbar(isDarkMode).bg,
            // shadowColor: theme.toolbar(isDarkMode).shadow,
        }
    })

export default ToolbarMacos;