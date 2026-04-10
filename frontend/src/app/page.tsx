import {PageTransition} from "@/presentation/components/transitions/PageTransition";
import {Button, Typography, Container, Box} from "@mui/material";

export default function Home() {
  return (
    <PageTransition>
      <Container maxWidth="md" className="py-12">
        <Box className="flex flex-col items-center justify-center gap-6 text-center">
          <Typography
            variant="h2"
            component="h1"
            className="font-bold text-primary-dark"
          >
            Welcome to DentiFlow
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Modern SaaS Platform for Dental Clinic Operations
          </Typography>

          <Box className="flex flex-wrap gap-4 mt-8">
            <Button
              variant="contained"
              size="large"
              className="bg-primary-main"
            >
              Get Started
            </Button>
            <Button variant="outlined" size="large">
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </PageTransition>
  );
}
