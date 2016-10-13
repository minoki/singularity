<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="1.0"
    >
  <xsl:output method="xml"
	      encoding="UTF-8"
	      />
  <xsl:template match="//xhtml:script/@src[string()='main.js']">
    <xsl:attribute name="src">main.min.js</xsl:attribute>
  </xsl:template>
  <xsl:template match="//xhtml:script/@src[string()='dynmml.js']">
    <xsl:attribute name="src">dynmml.min.js</xsl:attribute>
  </xsl:template>
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
