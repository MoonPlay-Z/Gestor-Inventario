import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ROLE_GROUPS } from './components/ui';
import { CookieBanner } from './components/CookieBanner';

// --- Public Pages ---
import { LandingPage }             from './pages/LandingPage';
import { LoginPage }               from './pages/LoginPage';
import { RegisterPage }            from './pages/RegisterPage';
import { SuscripcionExpiradaPage } from './pages/SuscripcionExpiradaPage';
import { PagosSaaSPage }           from './pages/PagosSaaSPage';
import { VisorPreciosPage }        from './pages/VisorPreciosPage';
import { BlogPage }               from './pages/BlogPage';
import { BlogArticlePage }        from './pages/BlogArticlePage';
import { CookiePolicyPage }        from './pages/CookiePolicyPage';
import { PrivacyPolicyPage }       from './pages/PrivacyPolicyPage';
import { TermsPage }               from './pages/TermsPage';

// --- Protected Pages ---
import { DashboardPage }    from './pages/DashboardPage';
import { PosPage }          from './pages/PosPage';
import { VentasPage }       from './pages/VentasPage';
import { PagosPage }        from './pages/PagosPage';
import { CajaPage }         from './pages/CajaPage';
import { CotizacionesPage } from './pages/CotizacionesPage';
import { ConfigPage }       from './pages/ConfigPage';
import { InventarioPage }   from './pages/InventarioPage';
import { ClientesPage }     from './pages/ClientesPage';
import { UsuariosPage }     from './pages/UsuariosPage';
import { ActivacionesPage } from './pages/ActivacionesPage';
import { ReportesPage }       from './pages/ReportesPage';

export default function AppRoutes() {
  return (
    <>
    <Routes>
      {/* ── Públicas — sin layout ─────────────────────────────── */}
      <Route path="/"          element={<LandingPage />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/registro"  element={<RegisterPage />} />
      <Route path="/pagos-saas" element={<PagosSaaSPage />} />
      <Route path="/blog"     element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogArticlePage />} />
      <Route path="/politica-cookies" element={<CookiePolicyPage />} />
      <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/suscripcion-expirada" element={
        <ProtectedRoute>
          <SuscripcionExpiradaPage />
        </ProtectedRoute>
      } />

      <Route path="/visor" element={
        <ProtectedRoute allowedRoles={ROLE_GROUPS.VISOR_ONLY}>
          <VisorPreciosPage />
        </ProtectedRoute>
      } />

      {/* ── Protegidas — dentro del Layout ───────────────────── */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Acceso: todos los roles */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Acceso: EMPRESA + CAJA (Operaciones) */}
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <PosPage />
          </ProtectedRoute>
        } />
        <Route path="/cotizaciones" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <CotizacionesPage />
          </ProtectedRoute>
        } />
        <Route path="/ventas" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <VentasPage />
          </ProtectedRoute>
        } />
        <Route path="/pagos" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <PagosPage />
          </ProtectedRoute>
        } />
        <Route path="/caja" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <CajaPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.REPORTES}>
            <ReportesPage />
          </ProtectedRoute>
        } />

        {/* Acceso: EMPRESA + INVENTARIO */}
        <Route path="/inventario" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.INVENTARIO}>
            <InventarioPage />
          </ProtectedRoute>
        } />

        {/* Acceso: EMPRESA + CAJA */}
        <Route path="/clientes" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.VENTAS}>
            <ClientesPage />
          </ProtectedRoute>
        } />

        {/* Acceso: solo EMPRESA */}
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_ONLY}>
            <UsuariosPage />
          </ProtectedRoute>
        } />
        <Route path="/activaciones" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.SUPER_ADMIN_ONLY}>
            <ActivacionesPage />
          </ProtectedRoute>
        } />
        <Route path="/config" element={
          <ProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_ONLY}>
            <ConfigPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch-all → dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>

    {/* Banner de cookies - se muestra en todas las páginas */}
    <CookieBanner />
    </>
  );
}
