// import { Form, Container, Row, Col, Button, Badge, Card, InputGroup } from 'react-bootstrap';
// import { useState } from 'react';
// import axios from 'axios';
// import config from 'config';

// //Components
// import Loading from '../../components/personalComponents/loading';
// import AlertModal from '../../components/personalComponents/alertModal';
// import FeatherIcon from 'feather-icons-react';

// export default function SetupOption() {
//     const [assetLocations, setAssetLocations] = useState(['']); // Array to store multiple asset locations
//     const [assetTypes, setAssetTypes] = useState(['']); // Array to store multiple asset types
//     const [assetCategories, setAssetCategories] = useState(['']); // Array to store multiple asset categories
//     const [componentTypes, setComponentTypes] = useState(['']); // Array to store multiple component types


//     // Alert state
//     const [showAlert, setShowAlert] = useState(false);
//     const [alertConfig, setAlertConfig] = useState({
//         type: 'success',
//         title: '',
//         description: ''
//     });

//     const [isLoading, setIsLoading] = useState(false);

//     const empInfo = JSON.parse(localStorage.getItem("user"));

//     // Function to show alert messages
//     const showAlertMessage = (type, title, description) => {
//         setAlertConfig({ type, title, description });
//         setShowAlert(true);
//     };

//     // Asset Location handlers
//     const addAssetLocation = () => {
//         setAssetLocations([...assetLocations, '']);
//     };

//     const updateAssetLocation = (index, value) => {
//         const updatedAssetLocations = [...assetLocations];
//         updatedAssetLocations[index] = value;
//         setAssetLocations(updatedAssetLocations);
//     };

//     const removeAssetLocation = (index) => {
//         const updatedAssetLocations = assetLocations.filter((_, i) => i !== index);
//         setAssetLocations(updatedAssetLocations);
//     };

//     // Asset Type handlers
//     const addAssetType = () => {
//         setAssetTypes([...assetTypes, '']);
//     };

//     const updateAssetType = (index, value) => {
//         const updatedAssetTypes = [...assetTypes];
//         updatedAssetTypes[index] = value;
//         setAssetTypes(updatedAssetTypes);
//     };

//     const removeAssetType = (index) => {
//         const updatedAssetTypes = assetTypes.filter((_, i) => i !== index);
//         setAssetTypes(updatedAssetTypes);
//     };

//     // Asset Category handlers
//     const addAssetCategory = () => {
//         setAssetCategories([...assetCategories, '']);
//     };

//     const updateAssetCategory = (index, value) => {
//         const updatedAssetCategories = [...assetCategories];
//         updatedAssetCategories[index] = value;
//         setAssetCategories(updatedAssetCategories);
//     };

//     const removeAssetCategory = (index) => {
//         const updatedAssetCategories = assetCategories.filter((_, i) => i !== index);
//         setAssetCategories(updatedAssetCategories);
//     };

//     // Component Type handlers
//     const addComponentType = () => {
//         setComponentTypes([...componentTypes, '']);
//     };

//     const updateComponentType = (index, value) => {
//         const updatedComponentTypes = [...componentTypes];
//         updatedComponentTypes[index] = value;
//         setComponentTypes(updatedComponentTypes);
//     };

//     const removeComponentType = (index) => {
//         const updatedComponentTypes = componentTypes.filter((_, i) => i !== index);
//         setComponentTypes(updatedComponentTypes);
//     };


//     const Validation = () => {
//         // Check if any field has been modified from the default empty string
//         const hasAnyInput = assetLocations.some(loc => loc.trim() !== '') ||
//             assetTypes.some(type => type.trim() !== '') ||
//             assetCategories.some(cat => cat.trim() !== '') ||
//             componentTypes.some(comp => comp.trim() !== '');

//         if (!hasAnyInput) {
//             showAlertMessage('error', 'Empty Fields', 'Please enter at least one value in any category before saving.');
//             return false;
//         }

//         // Optional: Validate that if a user has added multiple input fields,
//         // they're not all empty strings
//         const allAssetLocationsEmpty = assetLocations.every(loc => loc.trim() === '');
//         const allAssetTypesEmpty = assetTypes.every(type => type.trim() === '');
//         const allAssetCategoriesEmpty = assetCategories.every(cat => cat.trim() === '');
//         const allComponentTypesEmpty = componentTypes.every(comp => comp.trim() === '');

//         if (assetLocations.length > 0 && allAssetLocationsEmpty) {
//             showAlertMessage('error', 'Empty Fields', 'Asset Locations have empty fields. Please fill them or remove the empty entries.');
//             return false;
//         }

//         if (assetTypes.length > 0 && allAssetTypesEmpty) {
//             showAlertMessage('error', 'Empty Fields', 'Asset Types have empty fields. Please fill them or remove the empty entries.');
//             return false;
//         }

//         if (assetCategories.length > 0 && allAssetCategoriesEmpty) {
//             showAlertMessage('error', 'Empty Fields', 'Asset Categories have empty fields. Please fill them or remove the empty entries.');
//             return false;
//         }

//         if (componentTypes.length > 0 && allComponentTypesEmpty) {
//             showAlertMessage('error', 'Empty Fields', 'Component Types have empty fields. Please fill them or remove the empty entries.');
//             return false;
//         }

//         return true;
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);

//         if (!Validation()) {
//             setIsLoading(false);
//             return;
//         }

//         // Filter out empty values
//         const validAssetLocations = assetLocations.filter(location => location.trim() !== '');
//         const validAssetTypes = assetTypes.filter(type => type.trim() !== '');
//         const validAssetCategories = assetCategories.filter(category => category.trim() !== '');
//         const validComponentTypes = componentTypes.filter(component => component.trim() !== '');


//         try {
//             // Then, save asset options
//             await axios.post(`${config.baseApi}/assetsAnalysis/add-option`, {
//                 option_asset_location: validAssetLocations,
//                 option_asset_type: validAssetTypes,
//                 option_asset_category: validAssetCategories,
//                 option_component_types: validComponentTypes,
//                 created_by: empInfo.user_name
//             });

//             showAlertMessage('success', 'Saved Successfully', 'Your asset options have been saved successfully.');

//             setTimeout(() => {
//                 window.location.reload();
//             }, 100);

//             // Success message
//             console.log(`Saved Successfully!\n\n Asset Locations: ${validAssetLocations.length}\n Asset Types: ${validAssetTypes.length}\n Asset Categories: ${validAssetCategories.length}\n Component Types: ${validComponentTypes.length}\n\n Check console for detailed arrays`);

//         } catch (err) {
//             console.error('UNABLE TO SAVE ASSET OPTIONS', err);
//             showAlertMessage('error', 'Failed to Save', 'There was an error saving the asset options. Please check the console for details.');
//         }

//         // Console log arrays - this will show as arrays in the console
//         console.log('=== SUBMITTED DATA ===');
//         console.log('Asset Locations:', validAssetLocations);
//         console.log('Asset Types:', validAssetTypes);
//         console.log('Asset Categories:', validAssetCategories);
//         console.log('Component Types:', validComponentTypes);
//         console.log('=======================');
//     };

//     return (
//         <div style={{
//             background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//             minHeight: '100vh',
//             padding: '40px',
//             position: 'relative',
//             overflow: 'hidden',
//             paddingTop: '100px'
//         }}>
//             <Loading show={isLoading} />

//             {/* Alert Modal */}
//             {showAlert && (
//                 <div style={{
//                     position: 'fixed',
//                     top: '20px',
//                     right: '20px',
//                     zIndex: 9999
//                 }}>
//                     <AlertModal
//                         type={alertConfig.type}
//                         title={alertConfig.title}
//                         description={alertConfig.description}
//                         onClose={() => setShowAlert(false)}
//                         autoClose={5000}
//                     />
//                 </div>
//             )}
//             {/* Animated background elements */}
//             <div style={{
//                 position: 'absolute',
//                 width: '600px',
//                 height: '600px',
//                 borderRadius: '50%',
//                 background: 'rgb(255, 255, 255)',
//                 opacity: '0.05',
//                 top: '-200px',
//                 right: '-200px',
//                 animation: 'float 25s infinite ease-in-out',
//                 zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute',
//                 width: '400px',
//                 height: '400px',
//                 borderRadius: '50%',
//                 background: 'rgb(255, 255, 255)',
//                 opacity: '0.05',
//                 bottom: '-150px',
//                 left: '-150px',
//                 animation: 'float 20s infinite ease-in-out reverse',
//                 zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute',
//                 width: '300px',
//                 height: '300px',
//                 borderRadius: '50%',
//                 background: 'rgb(255, 255, 255)',
//                 opacity: '0.03',
//                 top: '50%',
//                 left: '20%',
//                 animation: 'float 18s infinite ease-in-out',
//                 zIndex: 1
//             }} />

//             <Container fluid style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
//                 <div style={{
//                     maxWidth: '1400px',
//                     margin: '0 auto'
//                 }}>

//                     {/* Header */}
//                     <div style={{
//                         marginBottom: '20px',
//                         textAlign: 'start'
//                     }}>
//                         <div style={{ marginBottom: '15px' }}>
//                             <h1 style={{
//                                 fontSize: '3.5rem',
//                                 fontWeight: '800',
//                                 color: '#EAB56F',
//                                 marginBottom: '10px',
//                                 letterSpacing: '-0.5px',
//                                 textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
//                             }}>Asset Option Setup</h1>
//                             <p style={{
//                                 fontSize: '1.2rem',
//                                 color: '#F9982F',
//                                 opacity: '0.9',
//                                 fontWeight: '400'
//                             }}>Configure your asset management preferences</p>
//                         </div>
//                     </div>


//                     <Card style={{
//                         background: '#fce5c7',
//                         borderRadius: "20px",
//                         boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
//                         border: 'none'
//                     }}>
//                         <Card.Body>
//                             <Form onSubmit={handleSubmit}>
//                                 {/* Asset Locations Section */}
//                                 <Form.Group className="mb-4">
//                                     <Form.Label style={{
//                                         fontWeight: "600",
//                                         fontSize: "16px",
//                                         color: '#254252',
//                                     }}>
//                                         Asset Locations
//                                     </Form.Label>

//                                     {assetLocations.map((location, index) => (
//                                         <InputGroup
//                                             key={`asset-location-${index}`}
//                                             className="mb-2"
//                                             style={{ display: 'flex', flexWrap: 'nowrap' }}
//                                         >
//                                             <InputGroup.Text
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
//                                                     border: '2px solid #e9ecef',
//                                                     borderRight: 'none',
//                                                     color: '#E37239',
//                                                     borderRadius: '12px 0 0 12px',
//                                                     padding: '0.75rem 1rem'
//                                                 }}
//                                             >
//                                                 <FeatherIcon icon="map-pin" />
//                                             </InputGroup.Text>
//                                             <Form.Control
//                                                 type="text"
//                                                 placeholder="Enter asset location"
//                                                 value={location}
//                                                 onChange={(e) => updateAssetLocation(index, e.target.value)}
//                                                 style={{
//                                                     backgroundColor: '#fff',
//                                                     border: '2px solid #e9ecef',
//                                                     borderLeft: 'none',
//                                                     borderRadius: '0 12px 12px 0',
//                                                     padding: '16px 20px',
//                                                     fontSize: '1rem',
//                                                     color: '#171C2D',
//                                                     flex: '1',
//                                                     outline: 'none',
//                                                     transition: 'all 0.3s ease'
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.target.style.borderColor = '#E37239';
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.target.style.borderColor = '#e9ecef';
//                                                 }}
//                                             />
//                                             {assetLocations.length > 1 && (
//                                                 <Button
//                                                     variant="danger"
//                                                     onClick={() => removeAssetLocation(index)}
//                                                     style={{
//                                                         borderRadius: "10px",
//                                                         fontWeight: "500",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             )}
//                                             {assetLocations.length === 1 && (
//                                                 <Button
//                                                     variant="outline-warning"
//                                                     onClick={addAssetLocation}
//                                                     style={{
//                                                         borderRadius: "12px",
//                                                         fontWeight: "500",
//                                                         borderWidth: "2px",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     + Add Another Asset Location
//                                                 </Button>
//                                             )}
//                                         </InputGroup>
//                                     ))}
//                                     {assetLocations.length > 1 && (
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
//                                             <Button
//                                                 variant="outline-warning"
//                                                 onClick={addAssetLocation}
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     fontWeight: "500",
//                                                     borderWidth: "2px",
//                                                     whiteSpace: 'nowrap',
//                                                     flexShrink: 0
//                                                 }}
//                                             >
//                                                 + Add Another Asset Location
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </Form.Group>

//                                 {/* Asset Types Section */}
//                                 <Form.Group className="mb-4">
//                                     <Form.Label style={{
//                                         fontWeight: "600",
//                                         fontSize: "16px",
//                                         color: '#254252',
//                                     }}>
//                                         Asset Types
//                                     </Form.Label>

//                                     {assetTypes.map((type, index) => (
//                                         <InputGroup key={`asset-type-${index}`}
//                                             className="mb-2"
//                                             style={{ display: 'flex', flexWrap: 'nowrap' }}
//                                         >
//                                             <InputGroup.Text
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
//                                                     border: '2px solid #e9ecef',
//                                                     borderRight: 'none',
//                                                     color: '#E37239',
//                                                     borderRadius: '12px 0 0 12px',
//                                                     padding: '0.75rem 1rem'
//                                                 }}
//                                             >
//                                                 <FeatherIcon icon="grid" />
//                                             </InputGroup.Text>
//                                             <Form.Control
//                                                 type="text"
//                                                 placeholder="Enter asset type"
//                                                 value={type}
//                                                 onChange={(e) => updateAssetType(index, e.target.value)}
//                                                 style={{
//                                                     backgroundColor: '#fff',
//                                                     border: '2px solid #e9ecef',
//                                                     borderLeft: 'none',
//                                                     borderRadius: '0 12px 12px 0',
//                                                     padding: '16px 20px',
//                                                     fontSize: '1rem',
//                                                     color: '#171C2D',
//                                                     flex: '1',
//                                                     outline: 'none',
//                                                     transition: 'all 0.3s ease'
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.target.style.borderColor = '#E37239';
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.target.style.borderColor = '#e9ecef';
//                                                 }}
//                                             />
//                                             {assetTypes.length > 1 && (
//                                                 <Button
//                                                     variant="danger"
//                                                     onClick={() => removeAssetType(index)}
//                                                     style={{
//                                                         borderRadius: "10px",
//                                                         fontWeight: "500",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             )}
//                                             {assetTypes.length === 1 && (
//                                                 <Button
//                                                     variant="outline-warning"
//                                                     onClick={addAssetType}
//                                                     style={{
//                                                         borderRadius: "12px",
//                                                         fontWeight: "500",
//                                                         borderWidth: "2px",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     + Add Another Asset Type
//                                                 </Button>
//                                             )}
//                                         </InputGroup>
//                                     ))}
//                                     {assetTypes.length > 1 && (
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
//                                             <Button
//                                                 variant="outline-warning"
//                                                 onClick={addAssetType}
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     fontWeight: "500",
//                                                     borderWidth: "2px",
//                                                     whiteSpace: 'nowrap',
//                                                     flexShrink: 0
//                                                 }}
//                                             >
//                                                 + Add Another Asset Type
//                                             </Button>
//                                         </div>
//                                     )}

//                                 </Form.Group>

//                                 {/* Asset Categories Section */}
//                                 <Form.Group className="mb-4">
//                                     <Form.Label style={{
//                                         fontWeight: "600",
//                                         fontSize: "16px",
//                                         color: '#254252',
//                                     }}>
//                                         Asset Categories
//                                     </Form.Label>

//                                     {assetCategories.map((category, index) => (
//                                         <InputGroup
//                                             key={`asset-category-${index}`}
//                                             className="mb-2"
//                                             style={{ display: 'flex', flexWrap: 'nowrap' }}
//                                         >
//                                             <InputGroup.Text
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
//                                                     border: '2px solid #e9ecef',
//                                                     borderRight: 'none',
//                                                     color: '#E37239',
//                                                     borderRadius: '12px 0 0 12px',
//                                                     padding: '0.75rem 1rem'
//                                                 }}
//                                             >
//                                                 <FeatherIcon icon="folder" />
//                                             </InputGroup.Text>
//                                             <Form.Control
//                                                 type="text"
//                                                 placeholder="Enter asset category"
//                                                 value={category}
//                                                 onChange={(e) => updateAssetCategory(index, e.target.value)}
//                                                 style={{
//                                                     backgroundColor: '#fff',
//                                                     border: '2px solid #e9ecef',
//                                                     borderLeft: 'none',
//                                                     borderRadius: '0 12px 12px 0',
//                                                     padding: '16px 20px',
//                                                     fontSize: '1rem',
//                                                     color: '#171C2D',
//                                                     flex: '1',
//                                                     outline: 'none',
//                                                     transition: 'all 0.3s ease'
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.target.style.borderColor = '#E37239';
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.target.style.borderColor = '#e9ecef';
//                                                 }}
//                                             />
//                                             {assetCategories.length > 1 && (
//                                                 <Button
//                                                     variant="danger"
//                                                     onClick={() => removeAssetCategory(index)}
//                                                     style={{
//                                                         borderRadius: "10px",
//                                                         fontWeight: "500",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             )}
//                                             {assetCategories.length === 1 && (
//                                                 <Button
//                                                     variant="outline-warning"
//                                                     onClick={addAssetCategory}
//                                                     style={{
//                                                         borderRadius: "12px",
//                                                         fontWeight: "500",
//                                                         borderWidth: "2px",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     + Add Another Asset Category
//                                                 </Button>
//                                             )}
//                                         </InputGroup>
//                                     ))}
//                                     {assetCategories.length > 1 && (
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

//                                             <Button
//                                                 variant="outline-warning"
//                                                 onClick={addAssetCategory}
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     fontWeight: "500",
//                                                     borderWidth: "2px",
//                                                     marginLeft: '8px',
//                                                     whiteSpace: 'nowrap',
//                                                     width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

//                                                     flexShrink: 0
//                                                 }}
//                                             >
//                                                 + Add Another Asset Category
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </Form.Group>

//                                 {/* Component Types Section */}
//                                 <Form.Group className="mb-4">
//                                     <Form.Label style={{
//                                         fontWeight: "600",
//                                         fontSize: "16px",
//                                         color: '#254252',
//                                     }}>
//                                         Component Types
//                                     </Form.Label>

//                                     {componentTypes.map((component, index) => (
//                                         <InputGroup
//                                             key={`component-type-${index}`}
//                                             className="mb-2"
//                                             style={{ display: 'flex', flexWrap: 'nowrap' }}
//                                         >
//                                             <InputGroup.Text
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
//                                                     border: '2px solid #e9ecef',
//                                                     borderRight: 'none',
//                                                     color: '#E37239',
//                                                     borderRadius: '12px 0 0 12px',
//                                                     padding: '0.75rem 1rem'
//                                                 }}
//                                             >
//                                                 <FeatherIcon icon="settings" />
//                                             </InputGroup.Text>
//                                             <Form.Control
//                                                 type="text"
//                                                 placeholder="Enter component type"
//                                                 value={component}
//                                                 onChange={(e) => updateComponentType(index, e.target.value)}
//                                                 style={{
//                                                     backgroundColor: '#fff',
//                                                     border: '2px solid #e9ecef',
//                                                     borderLeft: 'none',
//                                                     borderRadius: '0 12px 12px 0',
//                                                     padding: '16px 20px',
//                                                     fontSize: '1rem',
//                                                     color: '#171C2D',
//                                                     flex: '1',
//                                                     outline: 'none',
//                                                     transition: 'all 0.3s ease'
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.target.style.borderColor = '#E37239';
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.target.style.borderColor = '#e9ecef';
//                                                 }}
//                                             />
//                                             {componentTypes.length > 1 && (
//                                                 <Button
//                                                     variant="danger"
//                                                     onClick={() => removeComponentType(index)}
//                                                     s style={{
//                                                         borderRadius: "10px",
//                                                         fontWeight: "500",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             )}

//                                             {componentTypes.length === 1 && (
//                                                 <Button
//                                                     variant="outline-warning"
//                                                     onClick={addComponentType}
//                                                     style={{
//                                                         borderRadius: "12px",
//                                                         fontWeight: "500",
//                                                         borderWidth: "2px",
//                                                         marginLeft: '8px',
//                                                         whiteSpace: 'nowrap',
//                                                         width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

//                                                         flexShrink: 0
//                                                     }}
//                                                 >
//                                                     + Add Another Component Type
//                                                 </Button>
//                                             )}
//                                         </InputGroup>
//                                     ))}

//                                     {componentTypes.length > 1 && (
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

//                                             <Button
//                                                 variant="outline-warning"
//                                                 onClick={addComponentType}
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     fontWeight: "500",
//                                                     borderWidth: "2px",
//                                                     whiteSpace: 'nowrap',
//                                                     flexShrink: 0
//                                                 }}
//                                             >
//                                                 + Add Another Component Type
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </Form.Group>

//                                 {/* Submit Button */}
//                                 <Button
//                                     type="submit"
//                                     style={{
//                                         background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
//                                         border: 'none',
//                                         borderRadius: '12px',
//                                         padding: '16px 20px',
//                                         fontSize: '1rem',
//                                         fontWeight: '600',
//                                         width: '100%',
//                                         transition: 'all 0.3s ease'
//                                     }}
//                                     onMouseEnter={(e) => {
//                                         e.target.style.transform = 'scale(1.02)';
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         e.target.style.transform = 'scale(1)';
//                                     }}
//                                 >
//                                     Save All Options
//                                 </Button>
//                             </Form>
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </Container>

//             <style>
//                 {`
//                     @keyframes float {
//                         0%, 100% { transform: translate(0, 0) rotate(0deg); }
//                         33% { transform: translate(50px, -50px) rotate(120deg); }
//                         66% { transform: translate(-30px, 30px) rotate(240deg); }
//                     }
//                 `}
//             </style>
//         </div>
//     );
// }


import { Form, Container, Row, Col, Button, Card, InputGroup, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from 'config';

// Components
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from 'feather-icons-react';

export default function SetupOption() {
    const [assetLocations, setAssetLocations] = useState(['']);
    const [assetTypes, setAssetTypes] = useState(['']);
    const [assetCategories, setAssetCategories] = useState(['']);
    const [componentTypes, setComponentTypes] = useState(['']);

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const empInfo = JSON.parse(localStorage.getItem("user"));

    // Stats for summary
    const [stats, setStats] = useState({
        locations: 0,
        types: 0,
        categories: 0,
        components: 0
    });

    useEffect(() => {
        setStats({
            locations: assetLocations.filter(l => l.trim()).length,
            types: assetTypes.filter(t => t.trim()).length,
            categories: assetCategories.filter(c => c.trim()).length,
            components: componentTypes.filter(c => c.trim()).length
        });
    }, [assetLocations, assetTypes, assetCategories, componentTypes]);

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    // Generic handlers for dynamic arrays
    const addItem = (setter, currentArray) => {
        setter([...currentArray, '']);
    };

    const updateItem = (setter, currentArray, index, value) => {
        const updated = [...currentArray];
        updated[index] = value;
        setter(updated);
    };

    const removeItem = (setter, currentArray, index) => {
        const updated = currentArray.filter((_, i) => i !== index);
        setter(updated);
    };

    const Validation = () => {
        const hasAnyInput = assetLocations.some(loc => loc.trim() !== '') ||
            assetTypes.some(type => type.trim() !== '') ||
            assetCategories.some(cat => cat.trim() !== '') ||
            componentTypes.some(comp => comp.trim() !== '');

        if (!hasAnyInput) {
            showAlertMessage('error', 'Empty Fields', 'Please enter at least one value in any category before saving.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!Validation()) {
            setIsLoading(false);
            return;
        }

        const validAssetLocations = assetLocations.filter(location => location.trim() !== '');
        const validAssetTypes = assetTypes.filter(type => type.trim() !== '');
        const validAssetCategories = assetCategories.filter(category => category.trim() !== '');
        const validComponentTypes = componentTypes.filter(component => component.trim() !== '');

        try {
            await axios.post(`${config.baseApi}/assetsAnalysis/add-option`, {
                option_asset_location: validAssetLocations,
                option_asset_type: validAssetTypes,
                option_asset_category: validAssetCategories,
                option_component_types: validComponentTypes,
                created_by: empInfo.user_name
            });

            showAlertMessage('success', 'Saved Successfully', 'Your asset options have been saved successfully.');

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error('UNABLE TO SAVE ASSET OPTIONS', err);
            showAlertMessage('error', 'Failed to Save', 'There was an error saving the asset options.');
        }
        setIsLoading(false);
    };

    const renderDynamicSection = (title, icon, items, setItems, placeholder, color, gradientColor) => {
        const validCount = items.filter(i => i.trim()).length;

        return (
            <Card className="h-100 border-0" style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <Card.Header style={{
                    background: `linear-gradient(135deg, ${gradientColor}20, ${gradientColor}05)`,
                    borderBottom: `2px solid ${color}`,
                    padding: '1rem 1.25rem'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: `${color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: color
                            }}>
                                <FeatherIcon icon={icon} size={20} />
                            </div>
                            <div>
                                <h5 className="mb-0 fw-semibold" style={{ color: '#254252' }}>{title}</h5>
                                <small style={{ color: '#6c757d' }}>{validCount} item{validCount !== 1 ? 's' : ''} added</small>
                            </div>
                        </div>
                        <Badge style={{
                            background: `${color}15`,
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: '500'
                        }}>
                            {validCount}
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body style={{ padding: '1.25rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {items.map((item, index) => (
                        <InputGroup key={`${title}-${index}`} className="mb-2" style={{ alignItems: 'center' }}>
                            <Form.Control
                                type="text"
                                placeholder={placeholder}
                                value={item}
                                onChange={(e) => updateItem(setItems, items, index, e.target.value)}
                                style={{
                                    borderRadius: '12px',
                                    border: '1.5px solid #e9ecef',
                                    padding: '12px 16px',
                                    fontSize: '0.95rem',
                                    background: '#fff',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = color;
                                    e.target.style.boxShadow = `0 0 0 3px ${color}20`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e9ecef';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {items.length > 1 && (
                                <Button
                                    variant="link"
                                    onClick={() => removeItem(setItems, items, index)}
                                    style={{
                                        color: '#dc2626',
                                        textDecoration: 'none',
                                        padding: '8px 12px',
                                        marginLeft: '8px',
                                        borderRadius: '10px'
                                    }}
                                >
                                    <FeatherIcon icon="x" size={18} />
                                </Button>
                            )}
                        </InputGroup>
                    ))}

                    <Button
                        variant="light"
                        onClick={() => addItem(setItems, items)}
                        className="w-100 mt-2"
                        style={{
                            borderRadius: '12px',
                            padding: '10px',
                            background: '#f8f9fa',
                            border: '1.5px dashed #dee2e6',
                            color: '#6c757d',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = `${color}10`;
                            e.target.style.borderColor = color;
                            e.target.style.color = color;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#f8f9fa';
                            e.target.style.borderColor = '#dee2e6';
                            e.target.style.color = '#6c757d';
                        }}
                    >
                        <FeatherIcon icon="plus" size={16} className="me-1" />
                        Add Another
                    </Button>
                </Card.Body>
            </Card>
        );
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Loading show={isLoading} />

            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                top: '-200px',
                right: '-200px',
                animation: 'float 25s infinite ease-in-out',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                bottom: '-150px',
                left: '-150px',
                animation: 'float 20s infinite ease-in-out reverse',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                top: '50%',
                left: '20%',
                animation: 'float 18s infinite ease-in-out',
                zIndex: 1
            }} />

            {showAlert && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease'
                }}>
                    <AlertModal
                        type={alertConfig.type}
                        title={alertConfig.title}
                        description={alertConfig.description}
                        onClose={() => setShowAlert(false)}
                        autoClose={5000}
                    />
                </div>
            )}

            <Container fluid style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Header Section */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                color: '#EAB56F',
                                marginBottom: '10px',
                                letterSpacing: '-0.5px',
                                textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                            }}>
                                Asset Option Setup
                            </h1>
                            <p style={{
                                fontSize: '1.2rem',
                                color: '#F9982F',
                                opacity: '0.9',
                                fontWeight: '400'
                            }}>
                                Manage your asset taxonomy and component types
                            </p>
                        </div>

                        {/* Summary Stats */}
                        <div className="d-flex gap-2">
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '8px 20px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#60a5fa' }}>{stats.locations}</div>
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Locations</div>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '8px 20px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#a78bfa' }}>{stats.types}</div>
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Types</div>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '8px 20px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#34d399' }}>{stats.categories}</div>
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Categories</div>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '8px 20px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fbbf24' }}>{stats.components}</div>
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Components</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={6}>
                            {renderDynamicSection(
                                'Asset Locations',
                                'map-pin',
                                assetLocations,
                                setAssetLocations,
                                'e.g., New York, London, Tokyo',
                                '#3b82f6',
                                '#60a5fa'
                            )}
                        </Col>
                        <Col lg={6}>
                            {renderDynamicSection(
                                'Asset Types',
                                'grid',
                                assetTypes,
                                setAssetTypes,
                                'e.g., Hardware, Software, Vehicle',
                                '#8b5cf6',
                                '#a78bfa'
                            )}
                        </Col>
                        <Col lg={6}>
                            {renderDynamicSection(
                                'Asset Categories',
                                'folder',
                                assetCategories,
                                setAssetCategories,
                                'e.g., IT, Office, Production',
                                '#10b981',
                                '#34d399'
                            )}
                        </Col>
                        <Col lg={6}>
                            {renderDynamicSection(
                                'Component Types',
                                'settings',
                                componentTypes,
                                setComponentTypes,
                                'e.g., Processor, Memory, Display',
                                '#f59e0b',
                                '#fbbf24'
                            )}
                        </Col>
                    </Row>

                    {/* Action Buttons */}
                    <div className="mt-4 d-flex justify-content-end gap-3">
                        <Button
                            type="button"
                            variant="light"
                            onClick={() => {
                                setAssetLocations(['']);
                                setAssetTypes(['']);
                                setAssetCategories(['']);
                                setComponentTypes(['']);
                            }}
                            style={{
                                borderRadius: '14px',
                                padding: '12px 28px',
                                fontWeight: '600',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#F9982F',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            Clear All
                        </Button>
                        <Button
                            type="submit"
                            style={{
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '12px 32px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                color: '#ffffff'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(234, 181, 111, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >

                            Save Configuration
                        </Button>
                    </div>
                </Form>
            </Container>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateX(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.3);
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.5);
                    }
                `}
            </style>
        </div>
    );
}