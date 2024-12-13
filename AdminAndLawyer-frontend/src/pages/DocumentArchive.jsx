import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, CardActions, Button, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import useDocumentStore from "../stores/DocumentStore";
import SearchBar from "../components/SearchBar";

const DocumentList = () => {
  const { documents, fetchDocuments, loading, error } = useDocumentStore();
  const [filterType, setFilterType] = useState(""); // Tür için filtreleme
  const [filterDocumentType, setFilterDocumentType] = useState(""); // Dosya tipi için filtreleme
  const [searchTerm, setSearchTerm] = useState(""); // Arama çubuğu için terim
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments(); // Tüm dökümanları getirme isteği
  }, [fetchDocuments]);

  useEffect(() => {
    // Filtreleme ve arama işlemi
    let filtered = documents;

    if (filterType) {
      filtered = filtered.filter(
        (doc) => doc.documents[0]?.type === filterType
      );
    }

    if (filterDocumentType) {
      filtered = filtered.filter(
        (doc) => doc.documents[0]?.documentType === filterDocumentType
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.documents[0]?.documentDescription?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredDocuments(filtered);
  }, [filterType, filterDocumentType, searchTerm, documents]);

  if (loading) return <Typography variant="h6" align="center" mt={4}>Yükleniyor...</Typography>;
  if (error) return <Typography variant="h6" align="center" mt={4} color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography 
        variant="h4" 
        align="center" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#333", marginBottom: 4 }}
      >
        Döküman Listesi
      </Typography>

      {/* Filtreleme ve Arama Bölümü */}
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
        {/* Tür Filtreleme */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-type-label">Tür Seçin</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">Tüm Türler</MenuItem>
            <MenuItem value="Media Screening">Media Screening</MenuItem>
            <MenuItem value="NGO Data">NGO Data</MenuItem>
            <MenuItem value="Bar Commissions">Bar Commissions</MenuItem>
            <MenuItem value="Public Institutions">Public Institutions</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {/* Dosya Tipi Filtreleme */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-document-type-label">Dosya Tipi</InputLabel>
          <Select
            labelId="filter-document-type-label"
            value={filterDocumentType}
            onChange={(e) => setFilterDocumentType(e.target.value)}
          >
            <MenuItem value="">Tüm Tipler</MenuItem>
            <MenuItem value="files">Dosya</MenuItem>
            <MenuItem value="link">Link</MenuItem>
          </Select>
        </FormControl>

        {/* Arama Çubuğu */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Açıklamaya göre ara..."
        />
      </Box>

      <Grid container spacing={3}>
        {filteredDocuments.map((document, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              variant="outlined"
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.02)",
                },
                height: "100%",
              }}
            >
              <CardContent sx={{ padding: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#555" }}
                >
                  Açıklama:
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ marginBottom: 2, color: "#444" }}
                >
                  {document.documents[0]?.documentDescription || "Açıklama Yok"}
                </Typography>

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#555", marginTop: 2 }}
                >
                  Tür:
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ color: "#444" }}
                >
                  {document.documents[0]?.type || "Tür Belirtilmemiş"}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  justifyContent: "center",
                  padding: 2,
                  backgroundColor: "#f5f5f5",
                }}
              >
                {document.documents[0]?.documentType === "files" ? (
                  <Button
                    size="medium"
                    variant="contained"
                    color="primary"
                    href={document.documents[0]?.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dosyayı Görüntüle
                  </Button>
                ) : (
                  <Button
                    size="medium"
                    variant="contained"
                    color="secondary"
                    href={document.documents[0]?.documentSource}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linki Görüntüle
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocumentList;
