import { IdeaBoard } from "@/components/IdeaBoard";
import { Header } from "@/components/Header";
import { Box } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box minH="100vh" bg="bg.canvas">
      <Header />
      <IdeaBoard />
    </Box>
  );
}