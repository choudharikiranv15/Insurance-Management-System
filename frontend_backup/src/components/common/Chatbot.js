import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fab,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { chatbotService } from '../../services/apiService';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Add welcome message
      setMessages([{
        type: 'bot',
        text: 'Hello! I\'m your insurance assistant. How can I help you today?',
        timestamp: new Date()
      }]);
      loadSuggestions();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatbotService.getSuggestions();
      setSuggestions(response.data.data.slice(0, 4));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      text: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.chat(message);
      const botMessage = {
        type: 'bot',
        text: response.data.data.message,
        suggestions: response.data.data.suggestions,
        contextData: response.data.data.contextData,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if (botMessage.suggestions) {
        setSuggestions(botMessage.suggestions);
      }
    } catch (error) {
      toast.error('Failed to get response from chatbot');
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      <Collapse in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 380,
            height: 550,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BotIcon />
              <Typography variant="h6">Insurance Assistant</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            <List sx={{ p: 0 }}>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    px: 0,
                    py: 0.5
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '85%',
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main'
                      }}
                    >
                      {message.type === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: message.type === 'user' ? 'primary.light' : 'white',
                        color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>

                      {/* Context Data Display */}
                      {message.contextData && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {message.contextData.message}
                          </Typography>
                          {message.contextData.data && message.contextData.data.length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {message.contextData.data.slice(0, 3).map((item, idx) => (
                                <Typography key={idx} variant="caption" display="block">
                                  • {item.policyName || item.claimNumber || `₹${item.amount}`}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              {loading && (
                <ListItem sx={{ justifyContent: 'flex-start', py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <BotIcon fontSize="small" />
                    </Avatar>
                    <CircularProgress size={20} />
                  </Box>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>

            {/* Suggestions */}
            {suggestions.length > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    size="small"
                    clickable
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

export default Chatbot;
