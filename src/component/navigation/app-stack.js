import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from '../../screen/onboarding/Splash';

import Login from '../../screen/user/Login';
import Register from '../../screen/user/Register';
import Home from '../../screen/activity/Home';
import Welcome from '../../screen/user/Welcome';
import ForgetPassword from '../../screen/user/ForgetPassword';
import ChangePassword from '../../screen/user/ChangePassword';
import Cart from '../../screen/activity/Cart';
import Order from '../../screen/activity/Order';
import ConfirmOrder from '../../screen/activity/ConfirmOrder';
import BankDetails from '../../screen/activity/BankDetails';
import Confirmation from '../../screen/activity/Confirmation';
import Paystack from '../../screen/pay/Paystack';
import Rave from '../../screen/pay/Rave';
import Paypal from '../../screen/pay/PayPal';
import PayPalTwo from '../../screen/pay/PayPalTwo';
import Transactions from '../../screen/backoffice/Transactions';
import EditTransactions from '../../screen/backoffice/EditTransaction';
import Orders from '../../screen/shopper/Orders';
import StripePay from '../../screen/pay/StripePay';

class AppStack extends Component {

  render() {
    const Stack = createStackNavigator();
    return (
          <Stack.Navigator
          screenOptions={{ 
              gestureEnabled: false,
              headerTintColor: 'white',
              headerStyle: { backgroundColor: '#7862ff' }, //tomato
              //headerLeft: null,
              headerShown: false,
             }}
             initialRouteName="home">

            <Stack.Screen name="home" component={Home}   />
            <Stack.Screen name="cart" component={Cart}   />
            <Stack.Screen name="order" component={Order}   />
            <Stack.Screen name="confirm_order" component={ConfirmOrder}   />
            <Stack.Screen name="confirm" component={Confirmation}   />
            <Stack.Screen name="bank_details" component={BankDetails}   />
            <Stack.Screen name="paystack" component={Paystack}   />
            <Stack.Screen name="rave" component={Rave}   />
            <Stack.Screen name="paypal" component={Paypal}   />
            <Stack.Screen name="stripe" component={StripePay}   />
            
          </Stack.Navigator>
      );
  }

}

export default AppStack;