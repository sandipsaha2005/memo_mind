import { Container, Typography, Box } from "@mui/material";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }} >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Notebook AII
        </Typography>
      </Box>
      <Outlet />
    </Container>
  );
};

export default Layout;