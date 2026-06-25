import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";

import type { Source } from "../../types/notebook";

interface Props {
  sources: Source[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAdd: () => void;
}

const SourcesPanel = ({ sources, collapsed, onToggleCollapse, onAdd }: Props) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: collapsed ? "64px" : "260px",
        flexShrink: 0,
        transition: "width 0.25s ease",
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 2,
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Sources
          </Typography>
        )}

        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
          <IconButton size="small" onClick={onToggleCollapse}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
        {collapsed ? (
          <Tooltip title="Add more resource">
            <IconButton
              onClick={onAdd}
              sx={{
                width: "100%",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            onClick={onAdd}
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              borderStyle: "dashed",
              py: 1,
            }}
          >
            Add more resource
          </Button>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: collapsed ? 1 : 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {sources.map((source) => {
          const SourceIcon =
            source.type === "file" ? InsertDriveFileIcon : TextSnippetIcon;

          if (collapsed) {
            return (
              <Tooltip key={source.id} title={source.name} placement="right">
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 1,
                    borderRadius: "10px",
                    bgcolor: "#f9fafb",
                  }}
                >
                  {source.pending ? (
                    <CircularProgress size={18} />
                  ) : (
                    <SourceIcon fontSize="small" sx={{ color: "#6b7280" }} />
                  )}
                </Box>
              </Tooltip>
            );
          }

          return (
            <Box
              key={source.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "10px",
                bgcolor: "#f9fafb",
              }}
            >
              <SourceIcon fontSize="small" sx={{ color: "#6b7280" }} />

              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={source.name}
              >
                {source.name}
              </Typography>

              {source.pending && <CircularProgress size={14} />}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default SourcesPanel;
