import React, { useState, useEffect } from 'react';
import {
    Card, Button, Row, Col, Form, Pagination, Alert, Badge,
    Spinner, Modal, Dropdown, InputGroup, Table
} from 'react-bootstrap';
import { useCart } from '../context/cartContext'; // Corrected path to cartContext
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm'; // Assuming ProductForm is in the same 'components' folder

// Color palette
const colors = {

    primary: '#FF4532',
    secondary: '#00C853',
    accent: '#FF4500',
    darkText: '#1A202C',
    lightText: '#6c757d',
    background: '#FFFFFF',

    cardBg: '#D1D9E6',
    border: '#dee2e6',
    headerBg: '#343a40',
    hover: '##00C853',
    warning: '#dc3545',
    info: '#17a2b8',
    success: '#28a745',
};

// Inline SVG Icons (kept as provided, assuming they are defined elsewhere or directly in this file)
const IconSearch = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.088.121l4.353 4.353a1 1 0 0 0 1.414-1.414l-4.353-4.353q-.06-.044-.121-.088zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" /></svg>;
const IconCategory = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h13A1.5 1.5 0 0 1 16 2.5v11A1.5 1.5 0 0 1 14.5 15h-13A1.5 1.5 0 0 1 0 13.5zM1.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5z" /><path d="M2 5.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H5V8H2.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H10V8H7.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H15V8h-2.5zM2 9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H5V12H2.5zM7 9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H10V12H7.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H15V12h-2.5z" /></svg>;
const IconCart = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.13 4l1.25 5h8.52L13.73 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" /></svg>;
const IconSort = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 11.293zm3.5 0a.5.5 0 0 1 0-1h6a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h2a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1z" /></svg>;
const IconPlus = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" /></svg>;
const IconChevronDown = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 0 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" /></svg>;
const IconChevronUp = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" /></svg>;
const IconFilter = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" /></svg>;
const IconDotsVerticalRounded = ({ size = 22, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" /></svg>;
const IconEdit = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" /><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" /></svg>;
const IconTrash = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H1.5a1 1 0 0 1 0-1H4V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h1.5a1 1 0 0 1 1 1M5 2v1h6V2a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5M3 4H13v9a1 1 0 0 0 1 1H5a1 1 0 0 0 1-1V4z" /></svg>;
const IconInfoCircle = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" /><path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2-.176-.492-.246-.714-.246-.121 0-.279.06-.35.1l-.485 2.15zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2" /></svg>;
const IconShoppingCartPlus = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 2H3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-2a2 2 0 1 0 0-2h-1.11l-.401-1.607 1.498-7.985A.5.5 0 0 0 12 4h1.11L15.61 1H14a.5.5 0 0 0 0 1zM6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/></svg>;


const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(['all']);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showProductList, setShowProductList] = useState(true); // New state to control visibility of product list
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const { addToCart } = useCart(); // Use the addToCart function from context
    const pageSize = 10;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsRes = await axios.get('http://127.0.0.1:5000/api/products');

            const prodList = Array.isArray(productsRes.data) ? productsRes.data : [];
            setProducts(prodList);

            const cats = Array.from(new Set(prodList.map(p => p.category).filter(Boolean)));
            setCategories(['all', ...cats]);
        } catch (error) {
            toast.error('Failed to load data');
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredProducts = products
        .filter(p =>
            (selectedCategory === 'all' || p.category === selectedCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                comparison = (a.price || 0) - (b.price || 0); // Handle undefined/null price
            } else if (sortBy === 'stock') {
                comparison = (a.stock || 0) - (b.stock || 0); // Handle undefined/null stock
            } else if (sortBy === 'category') {
                comparison = (a.category || '').localeCompare(b.category || '');
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleUpdate = async (productData) => {
        try {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (key !== 'image' || value instanceof File) {
                    formData.append(key, value);
                }
            });

            if (selectedProduct) {
                await axios.put(`http://localhost:5000/api/products/${selectedProduct.id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/products', formData);
            }

            toast.success(`Product ${selectedProduct ? 'updated' : 'created'} successfully`);
            fetchProducts(); // Refetch data
            setShowEditModal(false);
            setSelectedProduct(null);
        } catch (error) {
            toast.error(error.response?.data?.error || `Error ${selectedProduct ? 'updating' : 'creating'} product`);
            console.error(`Error ${selectedProduct ? 'updating' : 'creating'} product:`, error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${selectedProduct.id}`);
            toast.success('Product deleted successfully');
            fetchProducts(); // Refetch data
            setShowDeleteModal(false);
            setSelectedProduct(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error deleting product');
            console.error("Error deleting product:", error);
        }
    };

    // Helper for product image URL
    const getProductImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'https://via.placeholder.com/150?text=No+Image';
        }
        // Assuming imagePath from backend is relative, adjust if necessary
        // e.g., if backend returns "/uploads/image.jpg", then:
        return `http://localhost:5000${imagePath}`;
    };


    return (
        <div className="py-2 px-md-5" style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Custom Styles */}
            <style>
                {`
                .stylish-card {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }

                .btn-custom-primary {
                    background-color: ${colors.primary};
                    border-color: ${colors.primary};
                    transition: all 0.3s ease;
                }
                .btn-custom-primary:hover {
                    background-color: ${colors.secondary};
                    border-color: ${colors.secondary};
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0, 128, 0, 0.2);
                }

                .input-group-stylish .input-group-text,
                .input-group-stylish .form-control {
                    border-radius: 8px !important;
                    border-color: ${colors.border};
                    background-color: ${colors.cardBg};
                }
                .input-group-stylish .form-control:focus {
                    border-color: ${colors.primary};
                    box-shadow: 0 0 0 0.25rem rgba(75, 0, 130, 0.25);
                }

                .dropdown-toggle-stylish {
                    border-radius: 8px !important;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${colors.darkText};
                    background-color: ${colors.cardBg};
                    border: 1px solid ${colors.border};
                }
                .dropdown-toggle-stylish:hover {
                    background-color: ${colors.hover};
                }
                .dropdown-menu-stylish {
                    border-radius: 8px;
                    border: 1px solid ${colors.border};
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .dropdown-item-stylish {
                    color: ${colors.darkText};
                    transition: background-color 0.2s ease;
                }
                .dropdown-item-stylish:active, .dropdown-item-stylish:hover {
                    background-color: ${colors.hover};
                    color: ${colors.primary};
                }

                .table-responsive-custom .table {
                    border-collapse: separate;
                    border-spacing: 0 10px; /* Space between rows */
                }
                .table-responsive-custom .table th {
                    background-color: ${colors.primary};
                    color: white;
                    border-bottom: none;
                    padding: 1rem;
                }
                .table-responsive-custom .table th:first-child {
                    border-top-left-radius: 8px;
                    border-bottom-left-radius: 8px;
                }
                .table-responsive-custom .table th:last-child {
                    border-top-right-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
                .table-responsive-custom .table tbody tr {
                    background-color: ${colors.cardBg};
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                    transition: all 0.2s ease;
                }
                .table-responsive-custom .table tbody tr:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
                }
                .table-responsive-custom .table td {
                    vertical-align: middle;
                    border-top: none; /* Remove default table borders */
                    padding: 1rem;
                }
                .table-responsive-custom .table td:first-child {
                    border-top-left-radius: 8px;
                    border-bottom-left-radius: 8px;
                }
                .table-responsive-custom .table td:last-child {
                    border-top-right-radius: 8px;
                    border-bottom-right-radius: 8px;
                }

                .table-responsive-custom .table .product-image {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid ${colors.border};
                }

                .action-dropdown .dropdown-toggle::after {
                    display: none;
                }
                .action-dropdown .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Modal Styling */
                .modal-content-stylish {
                    border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                    border: none;
                }

                .modal-header-stylish {
                    background-color: ${colors.primary};
                    color: white;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    padding: 1.5rem;
                    border-bottom: none;
                }

                .modal-title-stylish {
                    font-weight: bold;
                    font-size: 1.5rem;
                }

                .modal-body-stylish {
                    padding: 2rem;
                    background-color: ${colors.background};
                }

                .modal-footer-stylish {
                    border-top: 1px solid ${colors.border};
                    padding: 1.5rem;
                    background-color: ${colors.cardBg};
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                }

                .modal-image-preview {
                    width: 100%;
                    height: 200px;
                    object-fit: contain; /* Changed to contain to show full image without cropping */
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid ${colors.border};
                    background-color: ${colors.hover};
                }

                `}
            </style>

            <div className="d-flex justify-content-between align-items-center mb-5">
              
                <div className="d-flex align-items-center gap-3">
                    <Badge
                        bg="primary"
                        className=" py-3  d-flex align-items-center"
                        style={{ backgroundColor: colors.info, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}
                    >
                        Total Products: <span className="ms-2">{products.length}</span>
                    </Badge>
                    <Button
                        variant="primary"
                        onClick={() => { setSelectedProduct(null); setShowEditModal(true); setShowProductList(false); }} // Hide product list when adding/editing
                        className="btn-custom-primary d-flex align-items-center"
                    >
                        <IconPlus className="me-2" /> Add New Product
                    </Button>
                    <Button
                        variant="info"
                        onClick={() => setShowProductList(!showProductList)} // Toggle product list visibility
                        className="btn-custom-primary d-flex align-items-center"
                        style={{ backgroundColor: colors.info, borderColor: colors.info }}
                    >
                        {showProductList ? 'Hide Products' : 'Show Products'}
                    </Button>
                </div>
            </div>

            {/* Filter & Sort Section (Always visible) */}
            <Card className="mb-4 stylish-card">
                <Card.Body className="py-4">
                    <Row className="g-3 align-items-center">
                        <Col md={6} lg={4}>
                            <InputGroup className="input-group-stylish">
                                <InputGroup.Text>
                                    <IconSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search products by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ color: colors.darkText }}
                                />
                            </InputGroup>
                        </Col>

                        <Col md={2} lg={4}>
                            <div className="d-flex align-items-center gap-2">
                                <IconFilter style={{ color: colors.lightText, fontSize: '1.75rem' }} />
                                <Dropdown className="w-100">
                                    <Dropdown.Toggle
                                        variant="light"
                                        className="dropdown-toggle-stylish w-100 text-start"
                                    >
                                        <IconCategory />
                                        Filter by Category: <span className="fw-bold">{selectedCategory === 'all' ? 'All' : selectedCategory}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="dropdown-menu-stylish w-100">
                                        <Dropdown.Item
                                            onClick={() => setSelectedCategory('all')}
                                            className="dropdown-item-stylish"
                                        >
                                            All Categories
                                        </Dropdown.Item>
                                        {categories.filter(cat => cat !== 'all').map(category => (
                                            <Dropdown.Item
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className="dropdown-item-stylish"
                                            >
                                                {category}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Col>

                        <Col md={12} lg={2}>
                            <div className="d-flex align-items-center gap-2">
                                <IconSort style={{ color: colors.lightText, fontSize: '1.75rem' }} />
                                <Dropdown className="w-100">
                                    <Dropdown.Toggle
                                        variant="light"
                                        className="dropdown-toggle-stylish w-100 text-start"
                                    >
                                        Sort By: <span className="fw-bold">{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                                        {sortBy && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="dropdown-menu-stylish w-100">
                                        <Dropdown.Item onClick={() => handleSort('name')} className="dropdown-item-stylish">
                                            Product Name
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleSort('category')} className="dropdown-item-stylish">
                                            Category
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleSort('price')} className="dropdown-item-stylish">
                                            Price
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleSort('stock')} className="dropdown-item-stylish">
                                            Stock Quantity
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Product List Table (Conditional Visibility) */}
            {showProductList && (
                <>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center ">
                            <Spinner animation="border" role="status" style={{ color: colors.primary }}>
                                <span className="visually-hidden">Loading products...</span>
                            </Spinner>
                            <p className="ms-3 fs-5" style={{ color: colors.lightText }}>Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <Alert variant="info" className="text-center  stylish-card">
                            <IconInfoCircle size={24} className="me-2" /> No products found matching your criteria.
                        </Alert>
                    ) : (
                        <Card className="stylish-card">
                            <Card.Body className="p-0">
                                <div className="table-responsive table-responsive-custom">
                                    <Table hover className="m-0">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th onClick={() => handleSort('name')} className="cursor-pointer">
                                                    Product Name {sortBy === 'name' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                                </th>
                                                <th onClick={() => handleSort('category')} className="cursor-pointer">
                                                    Category {sortBy === 'category' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                                </th>
                                                <th onClick={() => handleSort('price')} className="cursor-pointer">
                                                    Price {sortBy === 'price' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                                </th>
                                                <th onClick={() => handleSort('stock')} className="cursor-pointer">
                                                    Stock {sortBy === 'stock' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                                </th>
                                                <th>Actions</th>
                                                <th>Add to Cart</th> {/* New column for Add to Cart */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <img
                                                            src={getProductImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="product-image"
                                                        />
                                                    </td>
                                                    <td><span className="fw-semibold" style={{ color: colors.darkText }}>{product.name}</span></td>
                                                    <td><Badge bg="secondary" style={{ backgroundColor: colors.info }}>{product.category || 'N/A'}</Badge></td>
                                                    <td
                                                        style={{
                                                            fontWeight: 'bold'
                                                        }}> <span style={{
                                                            color: 'red',
                                                            fontWeight: 'bold'
                                                        }}>
                                                                KSH :</span> {(product.price || 0).toFixed(2)}</td>
                                                    <td>
                                                        <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                                                            {product.stock} in stock
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Dropdown align="end" className="action-dropdown">
                                                            <Dropdown.Toggle variant="light" size="sm">
                                                                <IconDotsVerticalRounded />
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => { setSelectedProduct(product); setShowViewModal(true); }}>
                                                                    <IconInfoCircle className="me-2" /> View Details
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => { setSelectedProduct(product); setShowEditModal(true); setShowProductList(false); }}>
                                                                    <IconEdit className="me-2" /> Edit
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }} className="text-danger">
                                                                    <IconTrash className="me-2" /> Delete
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stock <= 0}
                                                            className="d-flex align-items-center justify-content-center"
                                                        >
                                                            <IconShoppingCartPlus size={16} className="me-1" />
                                                            Add
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* Product Modals */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setSelectedProduct(null); setShowProductList(true); }} centered dialogClassName="modal-90w">
                <Modal.Header closeButton className="modal-header-stylish">
                    <Modal.Title className="modal-title-stylish">{selectedProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    <ProductForm
                        product={selectedProduct}
                        onSave={handleUpdate}
                        onCancel={() => { setShowEditModal(false); setSelectedProduct(null); setShowProductList(true); }}
                    />
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setSelectedProduct(null); }} centered>
                <Modal.Header closeButton className="modal-header-stylish bg-danger">
                    <Modal.Title className="modal-title-stylish">Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    <Alert variant="danger" className="d-flex align-items-center">
                        <IconInfoCircle size={22} className="me-2" />
                        Are you sure you want to delete <span className="fw-bold mx-1">{selectedProduct?.name}</span>? This action cannot be undone.
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="modal-footer-stylish">
                    <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showViewModal} onHide={() => { setShowViewModal(false); setSelectedProduct(null); }} centered>
                <Modal.Header closeButton className="modal-header-stylish">
                    <Modal.Title className="modal-title-stylish">Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    {selectedProduct && (
                        <Card className="stylish-card">
                            <Card.Body>
                                <div className="text-center mb-3">
                                    <img
                                        src={getProductImageUrl(selectedProduct.image)}
                                        alt={selectedProduct.name}
                                        className="modal-image-preview"
                                    />
                                </div>
                                <Table bordered hover responsive>
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold">Name:</td>
                                            <td>{selectedProduct.name}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Description:</td>
                                            <td>{selectedProduct.description || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Category:</td>
                                            <td><Badge bg="info">{selectedProduct.category || 'N/A'}</Badge></td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Price:</td>
                                            <td><span style={{ color: 'red', fontWeight: 'bold' }}>KSH:</span> {(selectedProduct.price || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Stock:</td>
                                            <td>
                                                <Badge bg={selectedProduct.stock > 10 ? 'success' : selectedProduct.stock > 0 ? 'warning' : 'danger'}>
                                                    {selectedProduct.stock} in stock
                                                </Badge>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-stylish">
                    <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedProduct(null); }}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-custom-primary"
                        onClick={() => {
                            addToCart(selectedProduct);
                            toast.success(`${selectedProduct.name} added to cart!`);
                            setShowViewModal(false);
                        }}
                        disabled={selectedProduct?.stock <= 0}
                    >
                        <IconShoppingCartPlus size={16} className="me-1" /> Add to Cart
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProductList;