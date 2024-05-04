// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
// import { scrapeSupermarket } from '../utils/scrapingUtils'; // Assuming you have a separate file for scraping utilities

// const PriceComparisonScreen = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const supermarketUrl = 'https://www.shufersal.co.il/online/he/%D7%A7%D7%98%D7%92%D7%95%D7%A8%D7%99%D7%95%D7%AA/%D7%A1%D7%95%D7%A4%D7%A8%D7%9E%D7%A8%D7%A7%D7%98/%D7%A4%D7%99%D7%A8%D7%95%D7%AA-%D7%95%D7%99%D7%A8%D7%A7%D7%95%D7%AA/c/A04?q=:relevance:categories-3:A0408:categories-3:A04';
//         const productsData = await scrapeSupermarket(supermarketUrl);
//         setProducts(productsData);
//       } catch (error) {
//         console.error('Error scraping data:', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>מוצרי חלב-וביצים</Text>
//       <View style={styles.productList}>
//         {products.map((product, index) => (
//           <View key={index} style={styles.productItem}>
//             <Text style={styles.productName}>{product.productName}</Text>
//             <Text style={styles.productCode}>קוד המוצר:  {product.productCode}</Text>
//             <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
//             <Text style={styles.productPrice}>מחיר:  {product.price} {product.currency}</Text>
//             <Text></Text>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };


// export default PriceComparisonScreen;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     paddingVertical: 20,
//   },
//   title: {
//     marginTop:53,
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign:'center'  
// },
//   productList: {
//     width: '90%',
//     alignItems: 'flex-start',
//   },
//   productItem: {
//     marginBottom: 10,
//   },
//   productImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 10,
//     marginLeft:220
//   },
//   productName: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   productCode: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   productPrice: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
// });
