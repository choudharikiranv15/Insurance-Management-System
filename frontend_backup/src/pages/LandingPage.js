import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Divider,
  Stack,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Grid,
  Modal,
  Fade,
  Backdrop,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  VerifiedUser as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Policy as PolicyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  const handleOpenModal = (insurance) => {
    setSelectedInsurance(insurance);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInsurance(null);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: <ShieldIcon sx={{ fontSize: 40 }} />,
      title: 'Comprehensive Coverage',
      description: 'Protect what matters most with our wide range of insurance policies tailored to your needs.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Claims Processing',
      description: 'Quick and efficient claim settlements with our streamlined digital process.'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Customer Support',
      description: 'Round-the-clock assistance from our dedicated team of insurance experts.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Reliable',
      description: 'Your data is protected with bank-level security and encryption.'
    }
  ];

  const insuranceTypes = [
    {
      icon: <PolicyIcon sx={{ fontSize: 50, color: '#1976d2' }} />,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with comprehensive life insurance coverage.',
      color: '#1976d2',
      details: {
        overview: 'Life insurance provides financial protection for your loved ones in case of your untimely demise. Choose from term life, whole life, or universal life insurance policies.',
        coverage: [
          'Death benefit payout to beneficiaries',
          'Coverage amounts from $100,000 to $5,000,000',
          'Term options: 10, 20, or 30 years',
          'Optional riders for critical illness and disability',
          'Cash value accumulation (whole life policies)',
          'Tax-free benefits for beneficiaries'
        ],
        pricing: 'Starting from $25/month for $250,000 coverage'
      }
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50, color: '#2e7d32' }} />,
      title: 'Health Insurance',
      description: 'Complete healthcare coverage for you and your loved ones.',
      color: '#2e7d32',
      details: {
        overview: 'Comprehensive health insurance plans covering medical expenses, hospitalization, preventive care, and prescription medications for you and your family.',
        coverage: [
          'Inpatient and outpatient care',
          'Emergency services and ambulance',
          'Prescription drug coverage',
          'Preventive care and annual checkups',
          'Mental health and substance abuse treatment',
          'Maternity and newborn care',
          'Laboratory and diagnostic tests'
        ],
        pricing: 'Individual plans from $150/month, Family plans from $400/month'
      }
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 50, color: '#ed6c02' }} />,
      title: 'Auto Insurance',
      description: 'Comprehensive vehicle protection with flexible coverage options.',
      color: '#ed6c02',
      details: {
        overview: 'Protect your vehicle and yourself with comprehensive auto insurance covering liability, collision, and more. Get coverage for cars, motorcycles, and commercial vehicles.',
        coverage: [
          'Liability coverage (bodily injury & property damage)',
          'Collision and comprehensive coverage',
          'Uninsured/underinsured motorist protection',
          'Medical payments coverage',
          'Roadside assistance and towing',
          'Rental car reimbursement',
          'Glass repair with $0 deductible'
        ],
        pricing: 'Starting from $75/month with multi-car discounts available'
      }
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 50, color: '#9c27b0' }} />,
      title: 'Home Insurance',
      description: 'Protect your home and belongings with our reliable coverage.',
      color: '#9c27b0',
      details: {
        overview: 'Comprehensive home insurance protecting your property, belongings, and liability. Coverage for natural disasters, theft, and accidents.',
        coverage: [
          'Dwelling coverage for structure damage',
          'Personal property protection',
          'Liability coverage up to $500,000',
          'Additional living expenses if home is uninhabitable',
          'Natural disaster coverage (fire, wind, hail)',
          'Water damage and pipe burst protection',
          'Theft and vandalism coverage'
        ],
        pricing: 'Average $120/month based on home value and location'
      }
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50, color: '#d32f2f' }} />,
      title: 'Travel Insurance',
      description: 'Travel worry-free with comprehensive trip protection.',
      color: '#d32f2f',
      details: {
        overview: 'Travel with peace of mind knowing you\'re protected against trip cancellations, medical emergencies abroad, lost baggage, and travel delays.',
        coverage: [
          'Trip cancellation and interruption',
          'Emergency medical expenses abroad',
          'Emergency medical evacuation',
          'Lost, stolen, or delayed baggage',
          'Travel delays and missed connections',
          '24/7 travel assistance hotline',
          'Adventure sports coverage (optional)'
        ],
        pricing: 'From $30 per trip or $200/year for annual multi-trip coverage'
      }
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 50, color: '#0288d1' }} />,
      title: 'Business Insurance',
      description: 'Safeguard your business with tailored commercial coverage.',
      color: '#0288d1',
      details: {
        overview: 'Comprehensive business insurance protecting your company from various risks including property damage, liability claims, and business interruption.',
        coverage: [
          'General liability insurance',
          'Property and equipment coverage',
          'Business interruption insurance',
          'Professional liability (E&O)',
          'Workers\' compensation',
          'Cyber liability and data breach protection',
          'Commercial auto insurance'
        ],
        pricing: 'Custom quotes based on business size and industry, starting from $500/month'
      }
    }
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '100K+', label: 'Policies Issued' },
    { value: '99.5%', label: 'Claim Settlement' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Modern Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1.5, px: { xs: 0 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                cursor: 'pointer'
              }}
              onClick={() => scrollToSection('home')}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}
              >
                <ShieldIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                ClaimEase
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mr: 3, display: { xs: 'none', md: 'flex' } }}>
              <Button
                onClick={() => scrollToSection('home')}
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main'
                  }
                }}
              >
                Home
              </Button>
              <Button
                onClick={() => scrollToSection('services')}
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main'
                  }
                }}
              >
                Services
              </Button>
              <Button
                onClick={() => scrollToSection('features')}
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main'
                  }
                }}
              >
                Features
              </Button>
              <Button
                onClick={() => scrollToSection('contact')}
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main'
                  }
                }}
              >
                Contact
              </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: 'primary.dark'
                  }
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    boxShadow: '0 6px 16px rgba(102,126,234,0.5)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Trusted by 50,000+ Customers"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  mb: 3,
                  fontWeight: 600
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Your Trusted Partner in{' '}
                <Box component="span" sx={{ color: '#ffd700' }}>
                  Insurance Protection
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Comprehensive insurance solutions designed to protect you, your family, and your assets. Get instant quotes and manage everything online.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                >
                  <ShieldIcon sx={{ fontSize: 200, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 10, position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)'
          }}
        >
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Box id="features" sx={{ bgcolor: '#ffffff', py: 8, mb: 12 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose ClaimEase?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the difference with our customer-first approach and innovative solutions
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center'
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: '100%', md: 'calc(50% - 16px)' },
                display: 'flex'
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  height: 380,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: '3px solid #e0e0e0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  bgcolor: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(102,126,234,0.2)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flex: 1,
                    height: '100%'
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: 'primary.main',
                      flexShrink: 0
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      minHeight: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.8,
                      textAlign: 'center'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
      </Box>

      {/* Insurance Types Section */}
      <Box id="services" sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Our Insurance Solutions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Comprehensive coverage options tailored to protect every aspect of your life
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center'
            }}
          >
            {insuranceTypes.map((type, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: '100%', md: 'calc(33.333% - 21.33px)' },
                  display: 'flex'
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    bgcolor: 'white',
                    border: '3px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(102,126,234,0.2)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 3, md: 4 },
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      height: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: 3,
                        bgcolor: alpha(type.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        flexShrink: 0
                      }}
                    >
                      {type.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        minHeight: 64,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {type.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.8,
                        flex: 1
                      }}
                    >
                      {type.description}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        onClick={() => handleOpenModal(type)}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          color: type.color,
                          fontWeight: 600,
                          p: 0,
                          '&:hover': {
                            bgcolor: 'transparent',
                            transform: 'translateX(4px)'
                          },
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        Learn More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ my: 12 }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 8,
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of satisfied customers and secure your future today
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Free Account
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        id="contact"
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          pt: 8,
          pb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShieldIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ClaimEase
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.8 }}>
                Your trusted partner in comprehensive insurance solutions. Making insurance claims easy and hassle-free.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <InstagramIcon />
                </IconButton>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Services
              </Typography>
              <Stack spacing={1}>
                <Button
                  color="inherit"
                  onClick={() => scrollToSection('services')}
                  sx={{ justifyContent: 'flex-start', opacity: 0.8 }}
                >
                  Life Insurance
                </Button>
                <Button
                  color="inherit"
                  onClick={() => scrollToSection('services')}
                  sx={{ justifyContent: 'flex-start', opacity: 0.8 }}
                >
                  Health Insurance
                </Button>
                <Button
                  color="inherit"
                  onClick={() => scrollToSection('services')}
                  sx={{ justifyContent: 'flex-start', opacity: 0.8 }}
                >
                  Auto Insurance
                </Button>
                <Button
                  color="inherit"
                  onClick={() => scrollToSection('services')}
                  sx={{ justifyContent: 'flex-start', opacity: 0.8 }}
                >
                  Home Insurance
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Contact Us
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 2, opacity: 0.8 }} />
                  <Typography variant="body2">1-800-INSURE-ME</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 2, opacity: 0.8 }} />
                  <Typography variant="body2">support@claimease.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationIcon sx={{ mr: 2, opacity: 0.8 }} />
                  <Typography variant="body2">
                    123 Insurance Ave<br />
                    New York, NY 10001
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2024 ClaimEase. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Button
                size="small"
                onClick={() => alert('Privacy Policy page coming soon!')}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Privacy Policy
              </Button>
              <Button
                size="small"
                onClick={() => alert('Terms of Service page coming soon!')}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Terms of Service
              </Button>
              <Button
                size="small"
                onClick={() => alert('Cookie Policy page coming soon!')}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Cookie Policy
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Insurance Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '700px' },
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 0
            }}
          >
            {selectedInsurance && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${selectedInsurance.color} 0%, ${alpha(selectedInsurance.color, 0.7)} 100%)`,
                    color: 'white',
                    p: 4,
                    borderRadius: '12px 12px 0 0',
                    position: 'relative'
                  }}
                >
                  <IconButton
                    onClick={handleCloseModal}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    ✕
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3
                      }}
                    >
                      {selectedInsurance.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedInsurance.title}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {selectedInsurance.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Modal Content */}
                <Box sx={{ p: 4 }}>
                  {/* Overview */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: selectedInsurance.color }}>
                      Overview
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                      {selectedInsurance.details.overview}
                    </Typography>
                  </Box>

                  {/* Coverage Details */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: selectedInsurance.color }}>
                      What's Covered
                    </Typography>
                    <List sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
                      {selectedInsurance.details.coverage.map((item, index) => (
                        <ListItem key={index} sx={{ py: 1, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CheckCircleIcon sx={{ color: selectedInsurance.color, fontSize: 24 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                              fontSize: '0.95rem',
                              fontWeight: 500
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: selectedInsurance.color }}>
                      Pricing
                    </Typography>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: alpha(selectedInsurance.color, 0.05),
                        border: `2px solid ${alpha(selectedInsurance.color, 0.2)}`,
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, color: selectedInsurance.color, mb: 1 }}>
                        {selectedInsurance.details.pricing}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Final pricing may vary based on coverage options and individual circumstances
                      </Typography>
                    </Paper>
                  </Box>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        flex: 1,
                        bgcolor: selectedInsurance.color,
                        '&:hover': {
                          bgcolor: alpha(selectedInsurance.color, 0.8)
                        },
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleCloseModal}
                      sx={{
                        flex: 1,
                        borderColor: selectedInsurance.color,
                        color: selectedInsurance.color,
                        '&:hover': {
                          borderColor: selectedInsurance.color,
                          bgcolor: alpha(selectedInsurance.color, 0.05)
                        },
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Close
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default LandingPage;
