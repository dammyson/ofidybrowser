// React native and others libraries imports
import React, { Component } from 'react';
import { FlatList, Dimensions, View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
import { BarIndicator } from 'react-native-indicators';
import { Icon } from 'react-native-elements'
import colors from '../color';
import * as Animatable from 'react-native-animatable';
import InputTextField from './CustomInputTextField'
import { BaseUrl, getCurrency, getSessionID, showTopNotification, makeUrlStringFromObject } from '../../utilities/index';
import Moment from 'moment';
Moment.locale('en');
const moment = require('moment');

export default class SelectMethod extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: new Animated.Value(0),
            merchant: 'ay345',
            shippingmethod: [],
            address_list: [],
            visible: false,
            view_balance: false,
            loading: true,
            auth: '',
            card_name: '',
            selected_category: 0,
            search: '',
            currency: '',
            total_mileage:0
        };
        this.arrayholder = [];
    }

   async componentDidMount() {
        Animated.timing(this.state.progress, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
        }).start();
        this.setState({
            currency: await getCurrency() 
          });
        this._getAddress()

    }



    async _getAddress() {
        const { address, session_id } = this.props;
        const { currency } = this.state;
        this.setState({ loading: true })
        console.warn(address)

    
        let data = {
            'code': "order",
            'action': "getShippingCost",
            'currency': currency,
            'sessionId': await getSessionID(),
            'addressId': address.id,
            'address': address.addressLine1 + " " + address.city + " " + address.state,
        }

        var m = moment(new Date());
        m.add(60, 'minutes').minutes();
        const start = Moment(m).format('LT')
        var n = moment(new Date());
        n.add(90, 'minutes').minutes();
        const end = Moment(n).format('LT')
        console.warn(start, end)

        console.warn(BaseUrl()+'?'+makeUrlStringFromObject(data))

        fetch(BaseUrl()+'?'+makeUrlStringFromObject(data), {
            method: 'GET', headers: {
                Accept: 'application/json',
            },
        })
            .then(res => res.json())
            .then(res => {
                console.warn(res);
                if (!res.error) {
                    this.setState({
                        loading: false,
                        total_mileage:res.data.totalMileage,
                        shippingmethod: [
                            { id: 20, price: res.data.ShippingFee, name: 'Delivery charge: ' + this.getSymbol(currency)+ res.data.ShippingFee + '\nEstimated Delivery Time ' + start + " - "+  end}
                        ]
                    })
                } else {
                    showTopNotification('warning', res.message)
                    this.setState({ loading: false })
                }
            }).catch((error) => {
                console.warn(error.message);
            });
    }



    async getAddress() {
        const { address, session_id } = this.props;
        const { currency } = this.state;
        this.setState({ loading: true })
        console.warn(address)
        const formData = new FormData();
        formData.append('code', "order");
        formData.append('action', "getCost");
        formData.append('prf', currency);

        formData.append('sid', await getSessionID());
        formData.append('dest', address.id);

        fetch(BaseUrl(), {
            method: 'POST', headers: {
                Accept: 'application/json',
            }, body: formData,
        })
            .then(res => res.json())
            .then(res => {
                console.warn(res);
                if (!res.error) {
                    this.setState({
                        loading: false,
                        shippingmethod: [
                            { id: 20, price: res.data[0], name: 'Fast Shipping ' + res.data[0] + ' ' + res.data[5] }
                        ]
                    })
                } else {
                    Alert.alert('Operation failed', res.message, [{ text: 'Okay' }])
                    this.setState({ loading: false })
                }
            }).catch((error) => {
                console.warn(error);
                alert(error.message);
            });
    }



    searchFilterFunction = search => {
        this.setState({ search });
        const newData = this.arrayholder.filter(item => {
            const itemData = `${item.addressLine1.toUpperCase()} ${item.city.toUpperCase()}`;
            const textData = search.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        this.setState({
            address_list: newData,
        });

    };

    render() {
        const { name, message, onPress, onClose } = this.props;
        return (
            <>
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#00000040'
                    }}

                >

                </View>
                <View
                    style={styles.Container}
                >
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    </View>


                    <Animatable.View style={{ height: Dimensions.get('window').height / 2, alignItems: 'center', justifyContent: 'center', }} animation="fadeInUpBig" >
                        <View style={styles.body_top}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: 40 }}>
                                <TouchableOpacity onPress={() => onClose()}>


                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 14, margin: 7, flex: 1, fontFamily: 'NunitoSans-Light', fontStyle: 'italic', color: '#fff', textAlign: 'center', marginRight: 10 }}>Select shipping method</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 25 }}>
                                <TouchableOpacity onPress={() => onClose()}>
                                    <Icon
                                        name="closecircle"
                                        size={20}
                                        type='antdesign'
                                        color={colors.red}
                                    />

                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.body}>
                        <ImageBackground
                                style={{
                                    flex: 1,
                                }}
                                source={require('../../assets/bg.png')}>
                            <View style={{ marginTop: 10, marginLeft: 30, marginRight: 30 }}>

                            </View>
                            {this.state.loading ?
                                <View style={{ paddingTop: 1, paddingBottom: 10, flex: 1, justifyContent: 'center', }}>
                                    <View style={{ height: 50, }}>
                                        <BarIndicator color={colors.primary_color} count={4} size={30} />
                                        <Text style={{ fontSize: 14, margin: 7, flex: 1, fontFamily: 'NunitoSans-Light', fontStyle: 'italic', color: colors.primary_color, textAlign: 'center', marginRight: 10 }}>getting shipping method</Text>
                                    </View>
                                </View>
                                :
                                <View style={{ paddingTop: 1, paddingBottom: 10, flex: 1, }}>
                                    <FlatList
                                        style={{ paddingBottom: 5 }}
                                        data={this.state.shippingmethod}
                                        renderItem={this.renderItem}
                                        keyExtractor={item => item.id}
                                        ItemSeparatorComponent={this.renderSeparator}
                                        ListHeaderComponent={this.renderHeader}
                                    />
                                </View>

                            }

</ImageBackground>
                        </View>
                    </Animatable.View>


                </View>


            </>
        )
    }



    getSymbol(currency){
        if(currency == "NGN"){
            return " ₦"
        }
        else  if(currency == "USD"){
            return "$"
        }
        else  if(currency == "GBP"){
            return "£"
        }
    }

    _handleCategorySelect = (index) => {
        console.warn(index)
        const { onSelect, onMileage } = this.props;
        onSelect(index);
        onMileage(this.state.total_mileage);
    }
    renderItem = ({ item, }) => {
        return (
            <TouchableOpacity style={{ marginLeft: 20, marginRight: 20, marginBottom: 10, marginTop: 10, borderBottomColor: '#d1d1d1', borderBottomWidth: 0.5 }}
                onPress={() => this._handleCategorySelect(item)} underlayColor="red">
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, }}>
                        <Text style={styles.nameList}>{item.name}  </Text>

                    </View>
                </View>

            </TouchableOpacity>

        )



    }

}


SelectMethod;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    body_top: {
        backgroundColor: colors.primary_color,
        width: Dimensions.get('window').width,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row'

    },

    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 85,
    },
    body: {
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: '#fff'
    },
    mainbody: {
        width: Dimensions.get('window').width,
        flex: 1,
        marginRight: 13,
        marginLeft: 13,


    },
    title: {
        marginTop: 2,
        marginBottom: 2,
        marginRight: 13,
        marginLeft: 13,
        fontSize: 15,
        color: '#000',
        textAlign: 'center',
        fontWeight: '400',
    },
    textInputContainer: {
        marginRight: 25,
        marginLeft: 25,
    },
    input: {
        height: 65,
        borderColor: '#3E3E3E',
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        paddingLeft: 12
    },

    nameList: {
        fontSize: 13,
        color: '#272065',
        flex: 1,
        marginLeft: 10,
        marginBottom: 10,
        fontFamily: 'NunitoSans-Bold',
    },
    numberList: {
        fontSize: 13,
        color: '#272065',
        flex: 1,
        marginLeft: 15,
        fontFamily: 'NunitoSans-Regular',
    },
    modal: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: "#fff"

    },
    search_input: {
        marginTop: 5,
        height: 40,
        marginBottom: 10,
        color: '#000',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginLeft: 40,
        marginRight: 40,
        borderColor: '#000',
        borderWidth: 0.8,
        flexDirection: 'row'

    },
});


