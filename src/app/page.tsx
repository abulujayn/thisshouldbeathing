'use client';

import { IdeaBoard } from "@/components/IdeaBoard";
import { Header } from "@/components/Header";
import { Box, Button, VStack, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toaster, Toaster } from "@/components/ui/toaster";
import { DialogContent, DialogHeader, DialogRoot, DialogTitle, DialogBody } from "@/components/ui/dialog";

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';



export default function Home() {

  const [isAdmin, setIsAdmin] = useState(false);

  const [showAdminAuth, setShowAdminAuth] = useState(false);

  const [isSetup, setIsSetup] = useState<boolean | null>(null);

  const [authenticating, setAuthenticating] = useState(false);



  useEffect(() => {

    const checkStatus = async () => {

      try {

        const [verifyRes, statusRes] = await Promise.all([

          fetch('/api/admin/verify'),

          fetch('/api/admin/status')

        ]);

        

        if (verifyRes.ok) {

          setIsAdmin(true);

        }

        

        const statusData = await statusRes.json();

        setIsSetup(statusData.isSetup);

      } catch (e) {

        console.error("Failed to fetch admin status", e);

      }

    };

    checkStatus();

  }, []);



  const handleAdminAuth = async () => {

    if (isAdmin || authenticating || isSetup === null) return;

    

    setAuthenticating(true);

    setShowAdminAuth(true);



    try {

      if (isSetup) {

        // Login

        const optionsRes = await fetch('/api/admin/login/generate-options', { method: 'POST' });

        const options = await optionsRes.json();

        if (options.error) throw new Error(options.error);



        const asseResp = await startAuthentication({ optionsJSON: options });

        const verifyRes = await fetch('/api/admin/login/verify', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(asseResp),

        });



        const verification = await verifyRes.json();

        if (verification.verified) {

          setIsAdmin(true);

          setShowAdminAuth(false);

          toaster.create({ title: "Authenticated", type: "success" });

        } else {

          throw new Error('Verification failed');

        }

      } else {

        // Setup

        const optionsRes = await fetch('/api/admin/setup/generate-options', { method: 'POST' });

        const options = await optionsRes.json();

        if (options.error) throw new Error(options.error);



        const attResp = await startRegistration({ optionsJSON: options });

        const verifyRes = await fetch('/api/admin/setup/verify', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(attResp),

        });



        const verification = await verifyRes.json();

        if (verification.verified) {

          setIsAdmin(true);

          setShowAdminAuth(false);

          setIsSetup(true);

          toaster.create({ title: "Admin setup successful", type: "success" });

        } else {

          throw new Error('Verification failed');

        }

      }

    } catch (error: unknown) {

      console.error(error);

      if (error instanceof Error && error.name !== 'NotAllowedError') {

        toaster.create({ 

          title: isSetup ? "Authentication failed" : "Setup failed", 

          description: error.message, 

          type: "error" 

        });

      }

    } finally {

      setAuthenticating(false);

    }

  };



  const handleLogout = async () => {

    await fetch('/api/admin/logout', { method: 'POST' });

    setIsAdmin(false);

    toaster.create({ title: "Logged out", type: "info" });

  };



  return (

    <Box minH="100vh" bg="bg.canvas">

      <Toaster />

      <Header 

        isAdmin={isAdmin} 

        onAdminTrigger={handleAdminAuth} 

        onLogout={handleLogout}

      />

      

      <IdeaBoard isAdmin={isAdmin} />



      <DialogRoot open={showAdminAuth} onOpenChange={(e) => setShowAdminAuth(e.open)}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>{isSetup ? "Admin Login" : "Admin Setup"}</DialogTitle>

          </DialogHeader>

          <DialogBody pb={6}>

            <VStack gap={6} p={4} w="full">

              <Text textAlign="center" color="fg.muted">

                {isSetup 

                  ? "Use your passkey to access the admin interface." 

                  : "No admin passkey found. You are about to set up the primary admin passkey."}

              </Text>

              <Button 

                colorScheme="blue" 

                size="lg" 

                w="full" 

                onClick={handleAdminAuth}

                loading={authenticating}

              >

                {isSetup ? "Authenticate with Passkey" : "Setup Admin Passkey"}

              </Button>

            </VStack>

          </DialogBody>

        </DialogContent>

      </DialogRoot>

    </Box>

  );

}
