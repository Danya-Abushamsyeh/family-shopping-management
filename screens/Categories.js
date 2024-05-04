// import React from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// const ProductCategoriesScreen = () => {
//     const navigation = useNavigation();
//     const handleChoose = () => {
//         navigation.navigate('product');
//       };

//       const productCategories = [
//         { id: '1', name: 'פירוט וירוקות', image: require('./../assets/images/fruit.png') },
//         { id: '2', name: 'מוצרי חלב וביצים', image: require('./../assets/images/milk.png') },
//         { id: '3', name: 'בשר, עוף ודגים', image: require('./../assets/images/meat.png') },
//         { id: '4', name: 'לחמים ומוצרי מאפה', image: require('./../assets/images/bread.png') },
//         { id: '5', name: 'בישול, איפה ושימורים', image: require('./../assets/images/cook.png') },
//         { id: '6', name: 'חטיפים, מתוקים ודגנים', image: require('./../assets/images/cheps.png') },
//       ];
    
//       const renderCategoryItem = ({ item }) => (
//         <TouchableOpacity 
//           style={styles.categoryItem}
//           onPress={handleChoose}
//         >
//           <View style={styles.categoryImageContainer}>
//             <Image source={item.image} style={styles.categoryImage} />
//           </View>
//           <Text style={styles.categoryName}>{item.name}</Text>
//         </TouchableOpacity>
//       );
    
// return (
//     <View>
//     <View style={styles.logoContainer}>
//          <View style={styles.navigation}>
//           <TouchableOpacity style={styles.navItem} onPress={() => alert('About')}>
//             <Text>עזרה</Text>
//           </TouchableOpacity>
//         </View>
//          <View style={styles.searchContainer}>
//         <TouchableOpacity style={styles.searchButton} onPress={() => alert('Searching...')}>
//           <FontAwesomeIcon icon={faSearch} />
//         </TouchableOpacity>
//         <TextInput style={styles.searchInput} placeholder="חפש..." />
//         </View>
//         <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
//       </View>

//      <View style={styles.container}>
//           <FlatList
//             data={productCategories}
//             renderItem={renderCategoryItem}
//             keyExtractor={item => item.id}  />
//     </View>
//     </View>

//       );
//     };
    
//     const styles = StyleSheet.create({
 
//       logo: {
//         width: 50,
//         height: 50,
//         marginRight: 20,
//       },
//       logoContainer: {
//         marginTop:53,
//         paddingVertical: 5,
//         backgroundColor: '#e9a1a1',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//       },
//       navigation: {
//         flexDirection: 'row',
//       },
//       navItem: {
//         marginLeft: 20,
//       },
//       searchContainer: {
//         width: 230,
//         height: 30,
//         flexDirection: 'row',
//         backgroundColor: '#fff',
//         borderRadius: 5,
//         paddingHorizontal: 8,
//         alignItems: 'center',
//         marginTop: 6,
//       },
//       searchInput: {
//         flex: 1,
//         paddingVertical: 8,
//         marginLeft: 140,
    
//       },
//       searchButton: {
//         padding: 10,
//       },
//       categoryItem: {
//         alignItems: 'center',
//         marginBottom: 20,
//       },
//       categoryImageContainer: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         overflow: 'hidden',
//         marginBottom: 10,
//       },
//       categoryImage: {
//         width: '100%',
//         height: '100%',
//       },
//       categoryName: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         textAlign: 'center',
//       },
//     });
    
// export default ProductCategoriesScreen;
