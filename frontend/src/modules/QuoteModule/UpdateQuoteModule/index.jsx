{/*import NotFound from '@/components/NotFound';

import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import QuoteForm from '@/modules/QuoteModule/Forms/QuoteForm';

import PageLoader from '@/components/PageLoader';

import { erp } from '@/redux/erp/actions';
import useLanguage from '@/locale/useLanguage';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateQuoteModule({ config }) {
  const dispatch = useDispatch();

  const { id } = useParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  useLayoutEffect(() => {
    if (currentResult) {
      dispatch(erp.currentAction({ actionType: 'update', data: currentResult }));
    }
  }, [currentResult]);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <UpdateItem config={config} UpdateForm={QuoteForm} />
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
*/}



import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, message, Alert } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import QuoteForm from "../Forms/QuoteForm";

const API = "http://localhost:8888/api/quote";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function UpdateQuoteModule({ config }) {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const safeConfig = useMemo(
    () =>
      config || {
        entity: "quote",
      },
    [config]
  );

  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(null);

  // ✅ Fetch quote details
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoadingQuote(true);
        const res = await axios.get(`${API}/read/${id}`, {
          headers: { ...authHeaders() },
        });
        const quote = res.data?.result;
        setCurrentQuote(quote || null);

        if (quote) {
          form.setFieldsValue({
            ...quote,
            leadId: quote.leadId,
          });
        }
      } catch (err) {
        message.error(
          err?.response?.data?.message || err?.message || "Failed to load quote"
        );
      } finally {
        setLoadingQuote(false);
      }
    };

    if (id) fetchQuote();
  }, [id, form]);

  const isLocked = currentQuote?.status === "Converted to Job";

  const onSubmit = async (values) => {
    try {
      if (isLocked) {
        message.warning("Converted quote cannot be edited.");
        return;
      }

      setLoading(true);
      const res = await axios.patch(`${API}/update/${id}`, values, {
        headers: { ...authHeaders() },
      });

      if (!res.data?.success) throw new Error(res.data?.message || "Update failed");

      message.success(res.data?.message || "Quote updated");
      navigate(`/admin/quote/read/${id}`); // keep singular to match 3-dot links
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingQuote) {
    return (
      <Card title="Edit Quote" style={{ margin: 12 }}>
        Loading...
      </Card>
    );
  }

  if (!currentQuote) {
    return (
      <Card title="Edit Quote" style={{ margin: 12 }}>
        <Alert type="error" showIcon message="Quote not found" />
      </Card>
    );
  }

  return (
    <Card
      title={`Edit Quote (${currentQuote.quoteNumber || ""})`}
      style={{ margin: 12 }}
      extra={
        <>
          <a
            onClick={() => navigate(`/admin/quote/read/${id}`)}
            style={{ marginRight: 12 }}
          >
            Back
          </a>
        </>
      }
    >
      {isLocked && (
        <Alert
          type="info"
          showIcon
          message="This quote is already converted to a Job and is locked."
          style={{ marginBottom: 12 }}
        />
      )}

      <QuoteForm
        form={form}
        initialValues={currentQuote}
        onSubmit={onSubmit}
        onCancel={() => navigate(`/admin/quote/read/${id}`)}
        loading={loading}
      />
    </Card>
  );
}