/**
* This is the Checkout Page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import {Alert, ImageBackground, StyleSheet, StatusBar , TouchableHighlight, TouchableOpacity} from 'react-native';
import { Container, Content, Text, View, Picker, Grid, Col, Left, Right, Button, List, ListItem, Body, Radio, Input, Item } from 'native-base';
import { Icon, } from 'react-native-elements';
import _ from "lodash";

// Our custom files and classes import
import colors from '../color';
import Navbar from '../Navbar';
import SelectAddressType from './SelectAddressType';
import SelectCountry from './SelectCountry';
import SelectState from './SelectState';
import ActivityIndicator from './ActivityIndicator';
import { BaseUrl, getUserID, getSessionID, showTopNotification, getCountryDetails } from '../../utilities';
import {
  getLocation,
  geocodeLocationByName,
  geocodeAddressByName,
  geocodeLocationByCoords
} from '../../utilities/locationService';




export default class AddAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addType: [],
      type: [],
      addressone: '',
      addresstwo: '',
      addressthree: '',
      addressdesc: '',

      city: '',
      state: 0,
      country: 0,
      postcode: '',
      addtype: 0,
      type: 0,
      is_delivery_add: true,
      is_collection_add: true,
      show_address_type: false,
      region:'13',
      address_type: 'Address Type',
      country_name: 'Select Country',
      state_name: 'Select State',
      show_country: false,
      show_state: false,
      loading: false,
      aut: '',
      user_id: '',
      session_id: '',


      latitude: 6.5244,
      longitude: 3.3792,
      locationPredictions: []
     

    };

    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  async componentWillMount() {
    this.setState({
      user_id: await getUserID(),
      session_id: await getSessionID()
    });
  }

  componentDidMount() {
    
    var cordinates = getLocation();
    cordinates.then((result) => {
      this.setState({
        latitude: result.latitude,
        longitude: result.longitude
      });
      console.log(result);
      this.updateProfileRequest()
    }, err => {
      console.log(err);
    });
  }




  onChangeDestination = async (venue) => {
    const { longitude, latitude } = this.state;
    if (venue.lenght < 4) {
      return
    }
    const apiKey = 'AIzaSyBuEYeKLbJ0xnFwHKT-z2Kq174a3f7u4ac'
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${venue}&location=${latitude},${longitude}&radius=2000`;
    console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        locationPredictions: json.predictions
      });
    } catch (err) {
      console.error(err);
    }
  }


  onAddressSelected = (location) => {
    console.warn(location)
    console.warn(location.terms[0].value +" "+ location.terms[2].value)


    this.setState({ 
      locationPredictions: [], 
      address: location, 
      venue: location.description, 
      addressone: location.description,
      state_name:location.terms[location.terms.length - 2].value, 
      state:location.terms[location.terms.length - 2].value, 
      city:location.terms[location.terms.length - 3].value, 
    
    })

    this.onSelectCountry(getCountryDetails(location.terms[location.terms.length - 1].value))

    geocodeLocationByName(location.structured_formatting.main_text).then((result) => {
      console.warn(result)
      this.setState({
        latitude: result.lat, longitude: result.lng

      })
      //this.getRealDirection(result.lat,result.lng );
    }, err => {
      console.log(err);
    });
  }


  onSelectCountry(item){
    console.warn(item)
    this.setState({
      region: item.id,  country: item.id, country_name:  item.name})
  } 
  

  getRealDirection(lat, log){
    console.warn(lat, log)
    geocodeLocationByCoords(lat, log).then((result) => {
      console.warn(result)
    }, err => {
      console.log(err);
    });
  }

  renderPrediction = (predictions) => {
    let cat = [];
    for (var i = 0; i < predictions.length; i++) {
      let location = predictions[i]
      cat.push(
        <TouchableHighlight
          onPress={() => this.onAddressSelected(location)}>
          <View style={{ marginLeft: 10, marginRight: 10 }}>
            <Text style={{fontFamily: 'NunitoSans-Bold', fontSize: 13,}}>
              {predictions[i].structured_formatting.main_text}
            </Text>
            <Text style={{fontFamily: 'NunitoSans-Bold', fontSize: 13, color:"#00000070"}}>
              {predictions[i].description}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }
    return cat;
  }

  addAddress() {
    const { onClose, } = this.props;
    const { user_id, addressone, addresstwo, addressthree, addressdesc, city, state, country, postcode, address_type, type, is_delivery_add, is_collection_add, latitude,longitude } = this.state
    if (is_collection_add) { var deladd = 'Y'; } else { var deladd = 'N'; }
    if (is_delivery_add) { var colladd = 'Y'; } else { var colladd = 'N'; }

    console.warn(addressone, city, state, country, postcode, type)

    if (addressone == "" || city == "" || state == 0 || country == 0 || postcode == "" || type == 0) {
      Alert.alert('Validation failed', 'field(s) with * cannot be empty', [{ text: 'Okay' }])
      return
    }

    
    this.setState({ loading: true })
    const formData = new FormData();
    formData.append('code', "customer");
    formData.append('action', "addAddress");

    formData.append('id', user_id);
    formData.append('addr1', addressone);
    formData.append('addr2', addresstwo);
    formData.append('addr3', addressthree);
    formData.append('addrdesc', addressdesc);
    formData.append('deladdr', deladd);
    formData.append('coraddr', colladd);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('addrtype', 1);
    formData.append('postcode', postcode);
    formData.append('type', 1);
    formData.append('long', longitude);
    formData.append('latitude', latitude);


    console.warn(formData);
    fetch(BaseUrl(), {
      method: 'POST', headers: {
        Accept: 'application/json',
      }, body: formData,
    })
      .then(res => res.text())
      .then(res => {
        console.warn(res);
        showTopNotification("success", "Address Added")
        if (!res.error) {
          this.setState({
            loading: false,
          })
          onClose();

        } else {
          Alert.alert('Operation failed', res.message, [{ text: 'Okay' }])
          this.setState({ loading: false })
        }
      }).catch((error) => {
        console.warn(error);
        alert(error.message);
      });

      
  }



  render() {
    if (this.state.loading) {
      return (
        <ImageBackground
        style={{
          flex: 1, position: "absolute", top: 0, left: 0,bottom: 0,right: 0,
        }}
        source={require('../../assets/bg.png')}>
          <ActivityIndicator  color={colors.primary_color} message={'Adding Address'}  />
        </ImageBackground>
      );
    }

    const { onClose, } = this.props;
    var left = (
      <TouchableOpacity onPress={() => onClose()} >
        <Icon
          name="arrowleft"
          size={20}
          type='antdesign'
          color={colors.white}
        />
      </TouchableOpacity>
    );
    
    return (
      <ImageBackground
      style={{
        flex: 1, position: "absolute", top: 0, left: 0,bottom: 0,right: 0,
      }}
      source={require('../../assets/bg.png')}>
    
      <Container style={{ backgroundColor: 'transparent' , }}>
         <StatusBar barStyle="light-content" hidden={false} backgroundColor={colors.primary_color} />
        <Navbar left={left} title="New Address" />
        <Content padder>
          <View>
          <Text style={styles.actionbutton}>Add Address</Text>

            <View regular style={styles.item}>
              <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <Input placeholder='Address 1' 
              defaultValue={this.state.venue}
               onChangeText={venue => {
                  this.setState({ venue });
                  this.onChangeDestinationDebounced(venue);
                }} placeholderTextColor="#687373" style={styles.input} />
            </View>

            <View style={{backgroundColor:'#fff'}}>
                {this.renderPrediction(this.state.locationPredictions)}
              </View>

            {/* <View regular style={styles.item}>
              <Input placeholder='Address 2'  onChangeText={(text) => this.setState({ addresstwo: text })} placeholderTextColor="#687373" style={styles.input} />
            </View>


            <View regular style={styles.item}>
              <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <Input placeholder='Address Description' onChangeText={(text) => this.setState({ addressdesc: text })} placeholderTextColor="#687373" style={styles.input} />
            </View> */}


            <View regular style={styles.item}>
                <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 13, marginLeft: 7, }}>Delivery Address</Text>
                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 13, marginLeft: 17, }}>Yes</Text>
                <TouchableOpacity
                  onPress={() => this.setIsDeliveryAdd(true)}
                  style={{
                    borderRadius: 15,
                    width: 25,
                    height: 25,
                    borderColor: '#8d96a6',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 7,
                    marginRight: 5,

                  }}>
                  {this.state.is_delivery_add ?
                    <View style={{ width: 15, borderRadius: 15, height: 15, backgroundColor: colors.primary_color, }} />
                    : null
                  }


                </TouchableOpacity>
                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 13, }}>No</Text>
                <TouchableOpacity
                  onPress={() => this.setIsDeliveryAdd(false)}
                  style={{
                    borderRadius: 15,
                    width: 25,
                    height: 25,
                    borderColor: '#8d96a6',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 7,
                    marginRight: 5,

                  }}
                >
                  {!this.state.is_delivery_add ?
                    <View style={{ width: 15, borderRadius: 15, height: 15, backgroundColor: colors.primary_color, }} />
                    : null
                  }
                </TouchableOpacity>
              </View>



              {/* <View regular style={styles.item}>
                <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 13, marginLeft: 7, }}>Collection Address</Text>
                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 13, marginLeft: 17, }}>Yes</Text>
                <TouchableOpacity
                  onPress={() => this.setIsCollectionAdd(true)}
                  style={{
                    borderRadius: 15,
                    width: 25,
                    height: 25,
                    borderColor: '#8d96a6',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 7,
                    marginRight: 5,

                  }}>
                  {this.state.is_collection_add ?
                    <View style={{ width: 15, borderRadius: 15, height: 15, backgroundColor: colors.primary_color, }} />
                    : null
                  }


                </TouchableOpacity>
                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 13, }}>No</Text>
                <TouchableOpacity
                  onPress={() => this.setIsCollectionAdd(false)}
                  style={{
                    borderRadius: 15,
                    width: 25,
                    height: 25,
                    borderColor: '#8d96a6',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 7,
                    marginRight: 5,

                  }}
                >
                  {!this.state.is_collection_add ?
                    <View style={{ width: 15, borderRadius: 15, height: 15, backgroundColor: colors.primary_color, }} />
                    : null
                  }
                </TouchableOpacity>
              </View> */}
          

            <View regular style={styles.item}>
            <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.setState({ show_country: true })} style={{ marginLeft: 5, alignItems: 'center', flex: 1, justifyContent: 'flex-start', flexDirection: "row" }}>
                  <Text style={[{ fontFamily: 'NunitoSans-Regular', fontStyle: 'italic', color: colors.secondary_color, fontSize: 13, marginRight: 5 }, this.state.country_name == 'Select Country' ? { color: colors.text_inputplace_holder } : {}]}>{this.state.country_name}</Text>
                </TouchableOpacity>
              </View>
            </View>


            <View regular style={styles.item}>
            <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.setState({ show_state: true })} style={{ marginLeft: 5, alignItems: 'center', flex: 1, justifyContent: 'flex-start', flexDirection: "row" }}>
                  <Text style={[{ fontFamily: 'NunitoSans-Regular', fontStyle: 'italic', color: colors.secondary_color, fontSize: 13, marginRight: 5 }, this.state.state_name == 'Select State' ? { color: colors.text_inputplace_holder } : {}]}>{this.state.state_name}</Text>
                </TouchableOpacity>
              </View>
            </View>





            <View regular style={styles.item}>
              <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <Input placeholder='City' onChangeText={(text) => this.setState({ city: text })} defaultValue={this.state.city} placeholderTextColor="#687373" style={styles.input} />
            </View>



            <View regular style={styles.item}>
              <Text style={{ paddingLeft: 5, marginLeft: 0 }}>*</Text>
              <Input placeholder='Zip/Post Code' maxLength={6} keyboardType='numeric'style={styles.input}  onChangeText={(text) => this.setState({ postcode: text })} placeholderTextColor="#687373" />
            </View>

            <View regular style={styles.item}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.setState({ show_address_type: true })} style={{ marginLeft: 5, alignItems: 'center', flex: 1, justifyContent: 'flex-start', flexDirection: "row" }}>
                  <Text style={[{ fontFamily: 'NunitoSans-Regular', fontStyle: 'italic', color: colors.secondary_color, fontSize: 13, marginRight: 5 }, this.state.address_type == 'Address Type' ? { color: colors.text_inputplace_holder } : {}]}>{this.state.address_type}</Text>
                </TouchableOpacity>
              </View>
            </View>

         

          </View>
          <View>
          </View>
          <View style={{ marginTop: 10, marginBottom: 200, paddingBottom: 7 }}>
            <Button onPress={() => this.addAddress()} style={{ backgroundColor: colors.primary_color }} block iconLeft>
              <Text style={{ color: '#fdfdfd' }}>Add Address</Text>
            </Button>
          </View>
        </Content>
        {this.state.show_address_type ? this.renderSelectAddressType() : null}
        {/* {this.state.show_country ? this.renerSelectCountry() : null}
        {this.state.show_state ? this.renerSelectState() : null} */}
      </Container>
      </ImageBackground>
    );
  }

  setIsDeliveryAdd(value){
    this.setState({is_delivery_add: value})
  }

  setIsCollectionAdd(value){
    this.setState({is_collection_add: value})
  }

  renderSelectAddressType() {
    return(
      <SelectAddressType
      onSelect={(v) => this.onSelectAddressType(v)}
      onClose={()=> this.setState({show_address_type: false})} />
    )
  }
  onSelectAddressType(item){
    this.setState({show_address_type: false, 
      address_type: item.name , 
      type:item.id,
  
    })
  } 


  



  // renerSelectCountry() {
  //   return(
  //     <SelectCountry
  //     onSelect={(v) => this.onSelectCountry(v)}
  //     onClose={()=> this.setState({show_country: false})} />
  //   )
  // }
  // onSelectCountry(item){
  //   this.setState({show_country: false, region: item.id, country_name:  item.name})
  // } 
  

  // renerSelectState() {
  //   return(
  //     <SelectState
  //     region={"11"}
  //     onSelect={(v) => this.onSelectState(v)}
  //     onClose={()=> this.setState({show_country: false})} />
  //   )
  // }
  // onSelectState(item){
  //   this.setState({show_state: false, state: item.id, state_name:  item.name})
  // } 





  renderItems() {
    let items = [];
    this.state.cartItems.map((item, i) => {
      items.push(
        <ListItem
          key={i}
          style={{ marginLeft: 0 }}
        >
          <Body style={{ paddingLeft: 10 }}>
            <Text style={{ fontSize: 18 }}>
              {item.quantity > 1 ? item.quantity + "x " : null}
              {item.title}
            </Text>
            <Text style={{ fontSize: 14, fontStyle: 'italic' }}>Color: {item.color}</Text>
            <Text style={{ fontSize: 14, fontStyle: 'italic' }}>Size: {item.size}</Text>
          </Body>
          <Right>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{item.price}</Text>
          </Right>
        </ListItem>
      );
    });
    return items;
  }

  checkout() {
    console.log(this.state);
    alert("Check the log");
  }

}





const styles = StyleSheet.create({
  input: {
    height: 38,
    borderColor: '#3E3E3E',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'red',
    backgroundColor: colors.grey,
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13,
  },
  actionbutton: {
    marginTop: 7,
    marginBottom: 2,
    opacity: 0.5,
    fontSize: 13,
    color: '#0F0E43',
    textAlign: 'left',
    fontFamily: 'NunitoSans-Regular'
  },
  buttonContainer: {
    backgroundColor: colors.primary_color,
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  item: {
    height: 45,
    flexDirection: 'row',
    borderColor: '#8d96a6',
    borderWidth: 0.6,
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,

  },
  itemtwo: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,

  },
  invoice: {
    paddingLeft: 20,
    paddingRight: 20
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7'
  }
});
